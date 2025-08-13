#!/usr/bin/env python3
"""
Backend API Testing Suite for Project Management Dashboard

This script tests all the backend API endpoints including:
- Users CRUD operations
- Projects CRUD operations  
- Tasks CRUD operations
- Analytics endpoints
- AI insights endpoint

Uses the public endpoint from frontend/.env for testing.
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class ProjectManagementAPITester:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        self.api_base = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'users': [],
            'projects': [],
            'tasks': []
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, expected_status: int = 200) -> tuple:
        """Make HTTP request and return success status and response data"""
        url = f"{self.api_base}{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expected_status
            response_data = response.json() if response.content else {}
            
            if not success:
                return False, f"Expected {expected_status}, got {response.status_code}: {response_data}"
            
            return True, response_data

        except requests.exceptions.RequestException as e:
            return False, f"Request failed: {str(e)}"
        except json.JSONDecodeError as e:
            return False, f"JSON decode error: {str(e)}"
        except Exception as e:
            return False, f"Unexpected error: {str(e)}"

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, data = self.make_request('GET', '/')
        self.log_test("Root Endpoint", success, f"- {data.get('message', '')}" if success else f"- {data}")

    def test_users_crud(self):
        """Test all user CRUD operations"""
        print("\n🔍 Testing Users CRUD Operations...")
        
        # Test CREATE user
        user_data = {
            "name": "Test User",
            "email": "test@example.com",
            "role": "Developer",
            "avatar_url": "https://example.com/avatar.jpg"
        }
        
        success, data = self.make_request('POST', '/users', user_data, 200)
        if success:
            user_id = data.get('id')
            self.created_resources['users'].append(user_id)
            self.log_test("Create User", True, f"- ID: {user_id}")
        else:
            self.log_test("Create User", False, f"- {data}")
            return

        # Test GET all users
        success, data = self.make_request('GET', '/users')
        self.log_test("Get All Users", success, f"- Found {len(data) if success else 0} users")

        # Test GET user by ID
        success, data = self.make_request('GET', f'/users/{user_id}')
        self.log_test("Get User by ID", success, f"- Name: {data.get('name', 'N/A') if success else 'Failed'}")

        # Test UPDATE user
        update_data = {"name": "Updated Test User", "role": "Senior Developer"}
        success, data = self.make_request('PUT', f'/users/{user_id}', update_data)
        self.log_test("Update User", success, f"- New name: {data.get('name', 'N/A') if success else 'Failed'}")

        # Test DELETE user (will be done in cleanup)
        return user_id

    def test_projects_crud(self, owner_id: str):
        """Test all project CRUD operations"""
        print("\n🔍 Testing Projects CRUD Operations...")
        
        # Test CREATE project
        project_data = {
            "name": "Test Project",
            "description": "A test project for API testing",
            "status": "planning",
            "start_date": datetime.utcnow().isoformat(),
            "end_date": (datetime.utcnow() + timedelta(days=30)).isoformat(),
            "owner_id": owner_id,
            "team_members": [],
            "budget": 10000.0
        }
        
        success, data = self.make_request('POST', '/projects', project_data, 200)
        if success:
            project_id = data.get('id')
            self.created_resources['projects'].append(project_id)
            self.log_test("Create Project", True, f"- ID: {project_id}")
        else:
            self.log_test("Create Project", False, f"- {data}")
            return

        # Test GET all projects
        success, data = self.make_request('GET', '/projects')
        self.log_test("Get All Projects", success, f"- Found {len(data) if success else 0} projects")

        # Test GET project by ID
        success, data = self.make_request('GET', f'/projects/{project_id}')
        self.log_test("Get Project by ID", success, f"- Name: {data.get('name', 'N/A') if success else 'Failed'}")

        # Test UPDATE project
        update_data = {"name": "Updated Test Project", "status": "in_progress", "progress": 25.0}
        success, data = self.make_request('PUT', f'/projects/{project_id}', update_data)
        self.log_test("Update Project", success, f"- New status: {data.get('status', 'N/A') if success else 'Failed'}")

        return project_id

    def test_tasks_crud(self, project_id: str, assignee_id: str):
        """Test all task CRUD operations"""
        print("\n🔍 Testing Tasks CRUD Operations...")
        
        # Test CREATE task
        task_data = {
            "title": "Test Task",
            "description": "A test task for API testing",
            "status": "todo",
            "priority": "medium",
            "project_id": project_id,
            "assignee_id": assignee_id,
            "due_date": (datetime.utcnow() + timedelta(days=7)).isoformat(),
            "estimated_hours": 8.0
        }
        
        success, data = self.make_request('POST', '/tasks', task_data, 200)
        if success:
            task_id = data.get('id')
            self.created_resources['tasks'].append(task_id)
            self.log_test("Create Task", True, f"- ID: {task_id}")
        else:
            self.log_test("Create Task", False, f"- {data}")
            return

        # Test GET all tasks
        success, data = self.make_request('GET', '/tasks')
        self.log_test("Get All Tasks", success, f"- Found {len(data) if success else 0} tasks")

        # Test GET tasks by project
        success, data = self.make_request('GET', f'/tasks?project_id={project_id}')
        self.log_test("Get Tasks by Project", success, f"- Found {len(data) if success else 0} tasks for project")

        # Test GET task by ID
        success, data = self.make_request('GET', f'/tasks/{task_id}')
        self.log_test("Get Task by ID", success, f"- Title: {data.get('title', 'N/A') if success else 'Failed'}")

        # Test UPDATE task
        update_data = {"status": "in_progress", "actual_hours": 4.0}
        success, data = self.make_request('PUT', f'/tasks/{task_id}', update_data)
        self.log_test("Update Task", success, f"- New status: {data.get('status', 'N/A') if success else 'Failed'}")

        # Create another task to test project progress calculation
        task_data2 = {
            "title": "Second Test Task",
            "description": "Another test task",
            "status": "done",
            "priority": "high",
            "project_id": project_id,
            "assignee_id": assignee_id
        }
        
        success, data = self.make_request('POST', '/tasks', task_data2, 200)
        if success:
            task_id2 = data.get('id')
            self.created_resources['tasks'].append(task_id2)
            self.log_test("Create Second Task", True, f"- ID: {task_id2}")

        return task_id

    def test_analytics_endpoints(self):
        """Test analytics endpoints"""
        print("\n🔍 Testing Analytics Endpoints...")
        
        # Test project analytics
        success, data = self.make_request('GET', '/analytics/projects')
        if success:
            self.log_test("Project Analytics", True, 
                         f"- Total: {data.get('total_projects', 0)}, By Status: {len(data.get('projects_by_status', {}))}")
        else:
            self.log_test("Project Analytics", False, f"- {data}")

        # Test task analytics
        success, data = self.make_request('GET', '/analytics/tasks')
        if success:
            self.log_test("Task Analytics", True, 
                         f"- Total: {data.get('total_tasks', 0)}, Overdue: {data.get('overdue_tasks', 0)}")
        else:
            self.log_test("Task Analytics", False, f"- {data}")

    def test_ai_insights(self, project_id: str):
        """Test AI insights endpoint"""
        print("\n🔍 Testing AI Insights Endpoint...")
        
        success, data = self.make_request('GET', f'/ai/insights/{project_id}')
        if success:
            health = data.get('project_health', 'Unknown')
            recommendations = len(data.get('recommendations', []))
            risks = len(data.get('risk_factors', []))
            self.log_test("AI Insights", True, 
                         f"- Health: {health}, Recommendations: {recommendations}, Risks: {risks}")
        else:
            self.log_test("AI Insights", False, f"- {data}")

    def test_error_scenarios(self):
        """Test error handling scenarios"""
        print("\n🔍 Testing Error Scenarios...")
        
        # Test non-existent resource
        success, data = self.make_request('GET', '/users/non-existent-id', expected_status=404)
        self.log_test("Non-existent User", success, "- 404 error handled correctly")

        # Test invalid project creation (missing required field)
        invalid_project = {"description": "Missing name field"}
        success, data = self.make_request('POST', '/projects', invalid_project, expected_status=400)
        self.log_test("Invalid Project Creation", success, "- 400 error handled correctly")

        # Test task creation with non-existent project
        invalid_task = {
            "title": "Invalid Task",
            "project_id": "non-existent-project-id"
        }
        success, data = self.make_request('POST', '/tasks', invalid_task, expected_status=404)
        self.log_test("Task with Invalid Project", success, "- 404 error handled correctly")

    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Delete tasks first (due to foreign key constraints)
        for task_id in self.created_resources['tasks']:
            success, _ = self.make_request('DELETE', f'/tasks/{task_id}')
            if success:
                print(f"   Deleted task: {task_id}")

        # Delete projects
        for project_id in self.created_resources['projects']:
            success, _ = self.make_request('DELETE', f'/projects/{project_id}')
            if success:
                print(f"   Deleted project: {project_id}")

        # Delete users
        for user_id in self.created_resources['users']:
            success, _ = self.make_request('DELETE', f'/users/{user_id}')
            if success:
                print(f"   Deleted user: {user_id}")

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Project Management API Tests")
        print(f"Testing against: {self.api_base}")
        print("=" * 60)

        # Test basic connectivity
        self.test_root_endpoint()

        # Test CRUD operations
        user_id = self.test_users_crud()
        if not user_id:
            print("❌ Cannot continue without valid user - stopping tests")
            return False

        project_id = self.test_projects_crud(user_id)
        if not project_id:
            print("❌ Cannot continue without valid project - stopping tests")
            return False

        task_id = self.test_tasks_crud(project_id, user_id)

        # Test analytics and insights
        self.test_analytics_endpoints()
        self.test_ai_insights(project_id)

        # Test error scenarios
        self.test_error_scenarios()

        # Cleanup
        self.cleanup_resources()

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
    """Main function to run the tests"""
    # Use the backend URL from environment or default
    import os
    backend_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    
    print(f"Using backend URL: {backend_url}")
    
    tester = ProjectManagementAPITester(backend_url)
    success = tester.run_all_tests()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())