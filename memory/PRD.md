# Nigerian Tax Estimator - PRD

## Original Problem Statement
Build a simple Nigerian tax estimator web app with Personal Income Tax calculator, Salary PAYE estimator, Small Business Tax estimator, Tax education section, and Tax deadline reminder system. Mobile-friendly, beginner-focused, clean modular structure.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn UI components
- **Backend**: FastAPI + Motor (async MongoDB)
- **Database**: MongoDB
- **Auth**: JWT-based (register/login)
- **Styling**: Manrope (headings) + Inter (body), Forest Green (#064E3B) primary, Terracotta (#C2410C) accent

## User Personas
1. Nigerian salaried employee wanting to understand PAYE deductions
2. Freelancer/self-employed individual calculating personal income tax
3. Small business owner estimating company income tax

## Core Requirements (Static)
- [x] Personal Income Tax calculator with 2024/2025 graduated rates (7%-24%)
- [x] Salary PAYE estimator with pension/NHF deductions
- [x] Small business tax estimator with CIT tiers (0%/20%/30%)
- [x] Tax education section in plain English
- [x] Tax deadline reminder system (CRUD)
- [x] JWT authentication
- [x] Save calculations to database
- [x] Naira (₦) currency display

## What's Been Implemented (Feb 2026)
- Full-stack app with 8 pages (Home, Login, Register, PIT Calculator, PAYE Calculator, Business Tax, Education, Dashboard)
- Backend: 12 API endpoints (auth, calculations CRUD, reminders CRUD)
- Frontend: Responsive design, Shadcn UI, Framer Motion animations, Recharts pie chart
- Tax logic: Nigerian PIT graduated bands, CRA calculation, PAYE with pension/NHF, CIT tiers
- All tests passing (100% backend, 95% frontend)

## Prioritized Backlog
### P0 (Critical) - All Done
### P1 (Important)
- PDF export of tax calculations
- Edit reminders from dashboard
- Email notifications for upcoming deadlines
### P2 (Nice to have)
- Tax comparison tool (year over year)
- Multiple currency support
- Dark mode
- PWA support for mobile
