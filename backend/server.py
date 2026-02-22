from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import time
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ['JWT_SECRET']
JWT_ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()
api_router = APIRouter(prefix="/api")


# --- Models ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class CalculationCreate(BaseModel):
    calc_type: str
    inputs: dict
    results: dict

class CalculationResponse(BaseModel):
    id: str
    calc_type: str
    inputs: dict
    results: dict
    created_at: str

class ReminderCreate(BaseModel):
    title: str
    description: str
    due_date: str
    category: str

class ReminderUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    category: Optional[str] = None
    completed: Optional[bool] = None

class ReminderResponse(BaseModel):
    id: str
    title: str
    description: str
    due_date: str
    category: str
    completed: bool
    created_at: str


# --- Auth Helpers ---
def create_token(user_id: str) -> str:
    payload = {"user_id": user_id, "exp": int(time.time()) + 86400 * 7}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(authorization: str):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# --- Auth Endpoints ---
@api_router.post("/auth/register", response_model=TokenResponse)
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    hashed = pwd_context.hash(data.password)
    await db.users.insert_one({
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "password": hashed,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    token = create_token(user_id)
    return {"token": token, "user": {"id": user_id, "name": data.name, "email": data.email}}

@api_router.post("/auth/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = await db.users.find_one({"email": data.email}, {"_id": 0})
    if not user or not pwd_context.verify(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    return {"id": user["id"], "name": user["name"], "email": user["email"]}


# --- Calculations ---
@api_router.post("/calculations", response_model=CalculationResponse)
async def save_calculation(data: CalculationCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    calc_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    await db.calculations.insert_one({
        "id": calc_id,
        "user_id": user["id"],
        "calc_type": data.calc_type,
        "inputs": data.inputs,
        "results": data.results,
        "created_at": created_at
    })
    return {"id": calc_id, "calc_type": data.calc_type, "inputs": data.inputs, "results": data.results, "created_at": created_at}

@api_router.get("/calculations", response_model=List[CalculationResponse])
async def get_calculations(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    calcs = await db.calculations.find(
        {"user_id": user["id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).to_list(100)
    return calcs

@api_router.delete("/calculations/{calc_id}")
async def delete_calculation(calc_id: str, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    result = await db.calculations.delete_one({"id": calc_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Calculation not found")
    return {"message": "Deleted"}


# --- Reminders ---
@api_router.post("/reminders", response_model=ReminderResponse)
async def create_reminder(data: ReminderCreate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    reminder_id = str(uuid.uuid4())
    created_at = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": reminder_id,
        "user_id": user["id"],
        "title": data.title,
        "description": data.description,
        "due_date": data.due_date,
        "category": data.category,
        "completed": False,
        "created_at": created_at
    }
    await db.reminders.insert_one(doc)
    return {k: v for k, v in doc.items() if k not in ("_id", "user_id")}

@api_router.get("/reminders", response_model=List[ReminderResponse])
async def get_reminders(authorization: str = Header(None)):
    user = await get_current_user(authorization)
    reminders = await db.reminders.find(
        {"user_id": user["id"]},
        {"_id": 0, "user_id": 0}
    ).sort("due_date", 1).to_list(100)
    return reminders

@api_router.put("/reminders/{reminder_id}", response_model=ReminderResponse)
async def update_reminder(reminder_id: str, data: ReminderUpdate, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    update_data = {k: v for k, v in data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.reminders.find_one_and_update(
        {"id": reminder_id, "user_id": user["id"]},
        {"$set": update_data},
        projection={"_id": 0, "user_id": 0},
        return_document=ReturnDocument.AFTER
    )
    if not result:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return result

@api_router.delete("/reminders/{reminder_id}")
async def delete_reminder(reminder_id: str, authorization: str = Header(None)):
    user = await get_current_user(authorization)
    result = await db.reminders.delete_one({"id": reminder_id, "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")
    return {"message": "Deleted"}


@api_router.get("/")
async def root():
    return {"message": "Nigerian Tax Estimator API"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
