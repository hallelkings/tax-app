#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class NigerianTaxAPITester:
    def __init__(self, base_url="https://ng-tax-simple.preview.emergentagent.com"):
        self.base_url = base_url.rstrip('/')
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        
        # Test user credentials
        self.test_user = {
            "name": "Test User",
            "email": f"testuser_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "test123456"
        }
        
        # Existing user for login test
        self.existing_user = {
            "email": "test@example.com",
            "password": "test123"
        }

    def run_test(self, test_name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint.lstrip('/')}"
        
        if not headers:
            headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {test_name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            
            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                    
                self.failed_tests.append({
                    "test": test_name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": response.text
                })
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - Exception: {str(e)}")
            self.failed_tests.append({
                "test": test_name,
                "endpoint": endpoint,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test API health check"""
        return self.run_test("API Health Check", "GET", "/", 200)

    def test_register(self):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "/auth/register",
            200,
            data=self.test_user
        )
        
        if success and 'token' in response and 'user' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   ✓ Token received: {self.token[:20]}...")
            print(f"   ✓ User ID: {self.user_id}")
            return True
        return False

    def test_register_duplicate(self):
        """Test registration with duplicate email"""
        return self.run_test(
            "Duplicate Registration",
            "POST", 
            "/auth/register",
            400,
            data=self.test_user
        )

    def test_login_existing(self):
        """Test login with existing user"""
        success, response = self.run_test(
            "Login Existing User",
            "POST",
            "/auth/login", 
            200,
            data=self.existing_user
        )
        
        if success and 'token' in response:
            # Don't overwrite current test token
            print(f"   ✓ Login successful for existing user")
            return True
        return False

    def test_login_invalid(self):
        """Test login with invalid credentials"""
        return self.run_test(
            "Invalid Login",
            "POST",
            "/auth/login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )

    def test_get_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "/auth/me", 200)

    def test_get_me_unauthorized(self):
        """Test get me without token"""
        old_token = self.token
        self.token = None
        success, _ = self.run_test("Get Me Unauthorized", "GET", "/auth/me", 401)
        self.token = old_token  # Restore token
        return success

    def test_create_calculation(self):
        """Test creating a calculation"""
        calc_data = {
            "calc_type": "pit",
            "inputs": {"annualIncome": 5000000, "rentRelief": 500000},
            "results": {"finalTax": 654000, "monthlyTax": 54500, "effectiveRate": 13.08}
        }
        
        success, response = self.run_test(
            "Create PIT Calculation",
            "POST",
            "/calculations",
            200,
            data=calc_data
        )
        
        if success and 'id' in response:
            self.calculation_id = response['id']
            print(f"   ✓ Calculation saved with ID: {self.calculation_id}")
            return True
        return False

    def test_get_calculations(self):
        """Test retrieving calculations"""
        return self.run_test("Get Calculations", "GET", "/calculations", 200)

    def test_delete_calculation(self):
        """Test deleting a calculation"""
        if hasattr(self, 'calculation_id'):
            return self.run_test(
                "Delete Calculation",
                "DELETE", 
                f"/calculations/{self.calculation_id}",
                200
            )
        else:
            print("⚠️  Skipping delete calculation - no calculation ID available")
            return False

    def test_create_reminder(self):
        """Test creating a reminder"""
        reminder_data = {
            "title": "File Annual Tax Returns",
            "description": "Submit PIT returns for 2024",
            "due_date": "2025-01-31",
            "category": "filing"
        }
        
        success, response = self.run_test(
            "Create Reminder",
            "POST",
            "/reminders",
            200,
            data=reminder_data
        )
        
        if success and 'id' in response:
            self.reminder_id = response['id']
            print(f"   ✓ Reminder created with ID: {self.reminder_id}")
            return True
        return False

    def test_get_reminders(self):
        """Test retrieving reminders"""
        return self.run_test("Get Reminders", "GET", "/reminders", 200)

    def test_update_reminder(self):
        """Test updating a reminder"""
        if hasattr(self, 'reminder_id'):
            update_data = {"completed": True}
            return self.run_test(
                "Update Reminder",
                "PUT",
                f"/reminders/{self.reminder_id}",
                200,
                data=update_data
            )
        else:
            print("⚠️  Skipping update reminder - no reminder ID available")
            return False

    def test_delete_reminder(self):
        """Test deleting a reminder"""
        if hasattr(self, 'reminder_id'):
            return self.run_test(
                "Delete Reminder",
                "DELETE",
                f"/reminders/{self.reminder_id}",
                200
            )
        else:
            print("⚠️  Skipping delete reminder - no reminder ID available")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Nigerian Tax Estimator API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)

        # Health check
        self.test_health_check()

        # Auth tests
        self.test_register()
        self.test_register_duplicate()
        self.test_login_existing()
        self.test_login_invalid()
        self.test_get_me()
        self.test_get_me_unauthorized()

        # Calculation tests
        self.test_create_calculation()
        self.test_get_calculations()
        self.test_delete_calculation()

        # Reminder tests
        self.test_create_reminder()
        self.test_get_reminders()
        self.test_update_reminder()
        self.test_delete_reminder()

        # Summary
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"Total tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")

        if self.failed_tests:
            print("\n❌ FAILED TESTS:")
            for failure in self.failed_tests:
                print(f"  - {failure['test']}: {failure.get('error', 'Status code mismatch')}")

        return len(self.failed_tests) == 0


def main():
    tester = NigerianTaxAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())