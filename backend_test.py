#!/usr/bin/env python3
"""
HealthTestAI Backend API Testing Suite
Tests all API endpoints for the healthcare test case generation platform
"""

import requests
import json
import sys
from datetime import datetime
import time

class HealthTestAITester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()
        self.session.headers.update({'Content-Type': 'application/json'})

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def test_health_check(self):
        """Test the health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            if success:
                data = response.json()
                details += f", Response: {data}"
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False

    def test_get_requirements(self):
        """Test fetching all requirements"""
        try:
            response = self.session.get(f"{self.base_url}/api/requirements")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Count: {len(data) if isinstance(data, list) else 'Not a list'}"
                if isinstance(data, list) and len(data) > 0:
                    # Check structure of first requirement
                    req = data[0]
                    required_fields = ['id', 'jiraKey', 'title', 'description', 'priority', 'status']
                    missing_fields = [field for field in required_fields if field not in req]
                    if missing_fields:
                        details += f", Missing fields: {missing_fields}"
                        success = False
                    else:
                        details += f", Sample: {req.get('title', 'No title')[:50]}..."
            
            self.log_test("Get Requirements", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Requirements", False, f"Error: {str(e)}")
            return False, []

    def test_get_test_cases(self):
        """Test fetching all test cases"""
        try:
            response = self.session.get(f"{self.base_url}/api/test-cases")
            success = response.status_code == 200
            details = f"Status: {response.status_code}"
            
            if success:
                data = response.json()
                details += f", Count: {len(data) if isinstance(data, list) else 'Not a list'}"
                if isinstance(data, list) and len(data) > 0:
                    # Check structure of first test case
                    tc = data[0]
                    required_fields = ['id', 'requirementId', 'title', 'description', 'steps']
                    missing_fields = [field for field in required_fields if field not in tc]
                    if missing_fields:
                        details += f", Missing fields: {missing_fields}"
                        success = False
                    else:
                        details += f", Sample: {tc.get('title', 'No title')[:50]}..."
            
            self.log_test("Get Test Cases", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Test Cases", False, f"Error: {str(e)}")
            return False, []

    def test_get_requirement_by_id(self, requirement_id):
        """Test fetching a specific requirement by ID"""
        try:
            response = self.session.get(f"{self.base_url}/api/requirements/{requirement_id}")
            success = response.status_code == 200
            details = f"Status: {response.status_code}, ID: {requirement_id}"
            
            if success:
                data = response.json()
                details += f", Title: {data.get('title', 'No title')[:30]}..."
            
            self.log_test("Get Requirement by ID", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Get Requirement by ID", False, f"Error: {str(e)}")
            return False, {}

    def test_get_test_cases_by_requirement(self, requirement_id):
        """Test fetching test cases for a specific requirement"""
        try:
            response = self.session.get(f"{self.base_url}/api/test-cases/requirement/{requirement_id}")
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Req ID: {requirement_id}"
            
            if success:
                data = response.json()
                details += f", Count: {len(data) if isinstance(data, list) else 'Not a list'}"
            
            self.log_test("Get Test Cases by Requirement", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Test Cases by Requirement", False, f"Error: {str(e)}")
            return False, []

    def test_create_chat_session(self, requirement_id):
        """Test creating a chat session for AI test case generation"""
        try:
            payload = {"requirementId": requirement_id}
            response = self.session.post(f"{self.base_url}/api/chat/sessions", json=payload)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Req ID: {requirement_id}"
            
            session_id = None
            if success:
                data = response.json()
                session_id = data.get('sessionId')
                details += f", Session ID: {session_id}"
            
            self.log_test("Create Chat Session", success, details)
            return success, session_id
        except Exception as e:
            self.log_test("Create Chat Session", False, f"Error: {str(e)}")
            return False, None

    def test_send_chat_message(self, session_id, message="Generate test cases for this requirement"):
        """Test sending a message to AI chat"""
        try:
            payload = {"message": message}
            response = self.session.post(f"{self.base_url}/api/chat/sessions/{session_id}/messages", json=payload)
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Session: {session_id}"
            
            if success:
                data = response.json()
                details += f", Response type: {type(data)}"
            
            self.log_test("Send Chat Message", success, details)
            return success, response.json() if success else {}
        except Exception as e:
            self.log_test("Send Chat Message", False, f"Error: {str(e)}")
            return False, {}

    def test_get_chat_messages(self, session_id):
        """Test fetching chat messages"""
        try:
            response = self.session.get(f"{self.base_url}/api/chat/sessions/{session_id}/messages")
            success = response.status_code == 200
            details = f"Status: {response.status_code}, Session: {session_id}"
            
            if success:
                data = response.json()
                details += f", Messages count: {len(data) if isinstance(data, list) else 'Not a list'}"
            
            self.log_test("Get Chat Messages", success, details)
            return success, response.json() if success else []
        except Exception as e:
            self.log_test("Get Chat Messages", False, f"Error: {str(e)}")
            return False, []

    def run_comprehensive_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting HealthTestAI Backend API Tests")
        print("=" * 60)
        
        # Basic health check
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
        
        # Test requirements endpoints
        success, requirements = self.test_get_requirements()
        if not success or not requirements:
            print("❌ Requirements endpoint failed - stopping tests")
            return False
        
        # Test test cases endpoint
        self.test_get_test_cases()
        
        # Test specific requirement
        if requirements:
            first_req_id = requirements[0]['id']
            self.test_get_requirement_by_id(first_req_id)
            self.test_get_test_cases_by_requirement(first_req_id)
            
            # Test AI chat functionality
            success, session_id = self.test_create_chat_session(first_req_id)
            if success and session_id:
                # Wait a moment for session to be ready
                time.sleep(1)
                self.test_send_chat_message(session_id)
                # Wait for AI response
                time.sleep(2)
                self.test_get_chat_messages(session_id)
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    """Main test execution"""
    print(f"🔍 Testing HealthTestAI Backend at http://localhost:5000")
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tester = HealthTestAITester()
    success = tester.run_comprehensive_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())