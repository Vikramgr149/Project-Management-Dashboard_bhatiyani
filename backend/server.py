from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Project Management Dashboard API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums for project and task statuses
class ProjectStatus(str, Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# User Models
class User(BaseModel):
    """User model for team members"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    """Model for creating new users"""
    name: str
    email: str
    role: str
    avatar_url: Optional[str] = None

class UserUpdate(BaseModel):
    """Model for updating user information"""
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    avatar_url: Optional[str] = None

# Project Models
class Project(BaseModel):
    """Project model with comprehensive project information"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    owner_id: str
    team_members: List[str] = []
    progress: float = 0.0  # 0-100 percentage
    budget: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ProjectCreate(BaseModel):
    """Model for creating new projects"""
    name: str
    description: str
    status: ProjectStatus = ProjectStatus.PLANNING
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    owner_id: str
    team_members: List[str] = []
    budget: Optional[float] = None

class ProjectUpdate(BaseModel):
    """Model for updating project information"""
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    owner_id: Optional[str] = None
    team_members: Optional[List[str]] = None
    progress: Optional[float] = None
    budget: Optional[float] = None

# Task Models
class Task(BaseModel):
    """Task model for project tasks"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    project_id: str
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(BaseModel):
    """Model for creating new tasks"""
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    project_id: str
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None

class TaskUpdate(BaseModel):
    """Model for updating task information"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    actual_hours: Optional[float] = None

# Analytics Models
class ProjectAnalytics(BaseModel):
    """Analytics data for projects"""
    total_projects: int
    projects_by_status: Dict[str, int]
    projects_by_month: Dict[str, int]
    average_completion_time: Optional[float] = None

class TaskAnalytics(BaseModel):
    """Analytics data for tasks"""
    total_tasks: int
    tasks_by_status: Dict[str, int]
    tasks_by_priority: Dict[str, int]
    overdue_tasks: int

# Root endpoint
@api_router.get("/")
async def root():
    """Root endpoint returning API information"""
    return {"message": "Project Management Dashboard API", "version": "1.0.0"}

# User CRUD endpoints
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate):
    """Create a new user in the system"""
    try:
        user_dict = user.dict()
        user_obj = User(**user_dict)
        await db.users.insert_one(user_obj.dict())
        return user_obj
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/users", response_model=List[User])
async def get_users():
    """Retrieve all users from the system"""
    try:
        users = await db.users.find().to_list(1000)
        return [User(**user) for user in users]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Retrieve a specific user by ID"""
    try:
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return User(**user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, user_update: UserUpdate):
    """Update a user's information"""
    try:
        update_data = {k: v for k, v in user_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        result = await db.users.update_one({"id": user_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        updated_user = await db.users.find_one({"id": user_id})
        return User(**updated_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a user from the system"""
    try:
        result = await db.users.delete_one({"id": user_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        return {"message": "User deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Project CRUD endpoints
@api_router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate):
    """Create a new project"""
    try:
        project_dict = project.dict()
        project_obj = Project(**project_dict)
        await db.projects.insert_one(project_obj.dict())
        return project_obj
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/projects", response_model=List[Project])
async def get_projects():
    """Retrieve all projects from the system"""
    try:
        projects = await db.projects.find().to_list(1000)
        return [Project(**project) for project in projects]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Retrieve a specific project by ID"""
    try:
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return Project(**project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_update: ProjectUpdate):
    """Update a project's information"""
    try:
        update_data = {k: v for k, v in project_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        update_data["updated_at"] = datetime.utcnow()
        result = await db.projects.update_one({"id": project_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        
        updated_project = await db.projects.find_one({"id": project_id})
        return Project(**updated_project)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str):
    """Delete a project from the system"""
    try:
        # Also delete all tasks associated with this project
        await db.tasks.delete_many({"project_id": project_id})
        result = await db.projects.delete_one({"id": project_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project and associated tasks deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Task CRUD endpoints
@api_router.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    """Create a new task"""
    try:
        # Verify project exists
        project = await db.projects.find_one({"id": task.project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        task_dict = task.dict()
        task_obj = Task(**task_dict)
        await db.tasks.insert_one(task_obj.dict())
        return task_obj
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/tasks", response_model=List[Task])
async def get_tasks(project_id: Optional[str] = None):
    """Retrieve tasks, optionally filtered by project"""
    try:
        query = {"project_id": project_id} if project_id else {}
        tasks = await db.tasks.find(query).to_list(1000)
        return [Task(**task) for task in tasks]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/tasks/{task_id}", response_model=Task)
async def get_task(task_id: str):
    """Retrieve a specific task by ID"""
    try:
        task = await db.tasks.find_one({"id": task_id})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return Task(**task)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/tasks/{task_id}", response_model=Task)
async def update_task(task_id: str, task_update: TaskUpdate):
    """Update a task's information"""
    try:
        update_data = {k: v for k, v in task_update.dict().items() if v is not None}
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
        
        update_data["updated_at"] = datetime.utcnow()
        result = await db.tasks.update_one({"id": task_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        
        # Update project progress when task status changes
        if "status" in update_data:
            await update_project_progress(task_id)
        
        updated_task = await db.tasks.find_one({"id": task_id})
        return Task(**updated_task)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    """Delete a task from the system"""
    try:
        task = await db.tasks.find_one({"id": task_id})
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        project_id = task["project_id"]
        result = await db.tasks.delete_one({"id": task_id})
        
        # Update project progress after task deletion
        await update_project_progress_by_project_id(project_id)
        
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Analytics endpoints
@api_router.get("/analytics/projects", response_model=ProjectAnalytics)
async def get_project_analytics():
    """Get comprehensive project analytics"""
    try:
        # Total projects count
        total_projects = await db.projects.count_documents({})
        
        # Projects by status
        projects_by_status = {}
        for status in ProjectStatus:
            count = await db.projects.count_documents({"status": status.value})
            projects_by_status[status.value] = count
        
        # Projects by month (last 12 months)
        from datetime import datetime, timedelta
        import calendar
        
        projects_by_month = {}
        current_date = datetime.utcnow()
        for i in range(12):
            month_start = current_date.replace(day=1) - timedelta(days=30*i)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            month_name = calendar.month_name[month_start.month]
            
            count = await db.projects.count_documents({
                "created_at": {"$gte": month_start, "$lte": month_end}
            })
            projects_by_month[f"{month_name} {month_start.year}"] = count
        
        return ProjectAnalytics(
            total_projects=total_projects,
            projects_by_status=projects_by_status,
            projects_by_month=projects_by_month
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/analytics/tasks", response_model=TaskAnalytics)
async def get_task_analytics():
    """Get comprehensive task analytics"""
    try:
        # Total tasks count
        total_tasks = await db.tasks.count_documents({})
        
        # Tasks by status
        tasks_by_status = {}
        for status in TaskStatus:
            count = await db.tasks.count_documents({"status": status.value})
            tasks_by_status[status.value] = count
        
        # Tasks by priority
        tasks_by_priority = {}
        for priority in TaskPriority:
            count = await db.tasks.count_documents({"priority": priority.value})
            tasks_by_priority[priority.value] = count
        
        # Overdue tasks
        current_date = datetime.utcnow()
        overdue_tasks = await db.tasks.count_documents({
            "due_date": {"$lt": current_date},
            "status": {"$ne": TaskStatus.DONE.value}
        })
        
        return TaskAnalytics(
            total_tasks=total_tasks,
            tasks_by_status=tasks_by_status,
            tasks_by_priority=tasks_by_priority,
            overdue_tasks=overdue_tasks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Helper functions
async def update_project_progress(task_id: str):
    """Update project progress based on completed tasks"""
    try:
        task = await db.tasks.find_one({"id": task_id})
        if task:
            await update_project_progress_by_project_id(task["project_id"])
    except Exception as e:
        logging.error(f"Error updating project progress: {e}")

async def update_project_progress_by_project_id(project_id: str):
    """Update project progress based on project ID"""
    try:
        total_tasks = await db.tasks.count_documents({"project_id": project_id})
        if total_tasks > 0:
            completed_tasks = await db.tasks.count_documents({
                "project_id": project_id,
                "status": TaskStatus.DONE.value
            })
            progress = (completed_tasks / total_tasks) * 100
            await db.projects.update_one(
                {"id": project_id},
                {"$set": {"progress": progress, "updated_at": datetime.utcnow()}}
            )
    except Exception as e:
        logging.error(f"Error updating project progress: {e}")

# AI-powered insights endpoint
@api_router.get("/ai/insights/{project_id}")
async def get_project_insights(project_id: str):
    """Generate AI-powered insights for a specific project"""
    try:
        # Verify project exists
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get project tasks
        tasks = await db.tasks.find({"project_id": project_id}).to_list(1000)
        
        # Generate insights based on project data
        insights = {
            "project_health": calculate_project_health(project, tasks),
            "recommendations": generate_recommendations(project, tasks),
            "risk_factors": identify_risk_factors(project, tasks),
            "predicted_completion": predict_completion_date(project, tasks)
        }
        
        return insights
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def calculate_project_health(project: Dict[str, Any], tasks: List[Dict[str, Any]]) -> str:
    """Calculate overall project health based on various factors"""
    if not tasks:
        return "No tasks available"
    
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t["status"] == TaskStatus.DONE.value])
    overdue_tasks = len([t for t in tasks if t.get("due_date") and 
                        datetime.fromisoformat(t["due_date"].replace('Z', '+00:00')) < datetime.utcnow() and 
                        t["status"] != TaskStatus.DONE.value])
    
    completion_rate = completed_tasks / total_tasks if total_tasks > 0 else 0
    overdue_rate = overdue_tasks / total_tasks if total_tasks > 0 else 0
    
    if completion_rate > 0.8 and overdue_rate < 0.1:
        return "Excellent"
    elif completion_rate > 0.6 and overdue_rate < 0.2:
        return "Good"
    elif completion_rate > 0.4 and overdue_rate < 0.3:
        return "Average"
    else:
        return "Needs Attention"

def generate_recommendations(project: Dict[str, Any], tasks: List[Dict[str, Any]]) -> List[str]:
    """Generate AI-powered recommendations for project improvement"""
    recommendations = []
    
    if not tasks:
        recommendations.append("Add tasks to begin tracking project progress")
        return recommendations
    
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t["status"] == TaskStatus.DONE.value])
    in_progress_tasks = len([t for t in tasks if t["status"] == TaskStatus.IN_PROGRESS.value])
    high_priority_tasks = len([t for t in tasks if t["priority"] == TaskPriority.HIGH.value or t["priority"] == TaskPriority.CRITICAL.value])
    
    if completed_tasks / total_tasks < 0.3:
        recommendations.append("Focus on completing more tasks to improve project progress")
    
    if in_progress_tasks > total_tasks * 0.5:
        recommendations.append("Too many tasks in progress - consider focusing on fewer tasks at once")
    
    if high_priority_tasks > 0:
        recommendations.append(f"You have {high_priority_tasks} high-priority tasks that need attention")
    
    # Check for overdue tasks
    overdue_tasks = [t for t in tasks if t.get("due_date") and 
                    datetime.fromisoformat(t["due_date"].replace('Z', '+00:00')) < datetime.utcnow() and 
                    t["status"] != TaskStatus.DONE.value]
    
    if overdue_tasks:
        recommendations.append(f"Address {len(overdue_tasks)} overdue tasks to keep project on track")
    
    return recommendations

def identify_risk_factors(project: Dict[str, Any], tasks: List[Dict[str, Any]]) -> List[str]:
    """Identify potential risk factors for the project"""
    risks = []
    
    # Check project timeline
    if project.get("end_date"):
        end_date = datetime.fromisoformat(project["end_date"].replace('Z', '+00:00'))
        if end_date < datetime.utcnow():
            risks.append("Project deadline has passed")
        elif (end_date - datetime.utcnow()).days < 7:
            risks.append("Project deadline is approaching within a week")
    
    # Check task distribution
    if tasks:
        unassigned_tasks = len([t for t in tasks if not t.get("assignee_id")])
        if unassigned_tasks > 0:
            risks.append(f"{unassigned_tasks} tasks are unassigned")
    
    # Check progress vs time
    progress = project.get("progress", 0)
    if progress < 50 and project.get("end_date"):
        end_date = datetime.fromisoformat(project["end_date"].replace('Z', '+00:00'))
        time_passed = (datetime.utcnow() - datetime.fromisoformat(project["created_at"].replace('Z', '+00:00'))).days
        total_time = (end_date - datetime.fromisoformat(project["created_at"].replace('Z', '+00:00'))).days
        
        if total_time > 0 and time_passed / total_time > 0.5:
            risks.append("Project progress is behind schedule")
    
    return risks

def predict_completion_date(project: Dict[str, Any], tasks: List[Dict[str, Any]]) -> Optional[str]:
    """Predict project completion date based on current progress"""
    if not tasks:
        return None
    
    total_tasks = len(tasks)
    completed_tasks = len([t for t in tasks if t["status"] == TaskStatus.DONE.value])
    
    if completed_tasks == 0:
        return "Cannot predict - no completed tasks yet"
    
    # Simple prediction based on current completion rate
    progress_rate = completed_tasks / total_tasks
    if progress_rate >= 1.0:
        return "Project completed"
    
    # Estimate remaining time based on time per completed task
    project_age = (datetime.utcnow() - datetime.fromisoformat(project["created_at"].replace('Z', '+00:00'))).days
    if project_age > 0:
        days_per_task = project_age / completed_tasks
        remaining_tasks = total_tasks - completed_tasks
        estimated_days = remaining_tasks * days_per_task
        estimated_completion = datetime.utcnow() + timedelta(days=estimated_days)
        return estimated_completion.strftime("%Y-%m-%d")
    
    return "Cannot predict completion date"

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection on app shutdown"""
    client.close()
