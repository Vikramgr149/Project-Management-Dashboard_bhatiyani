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
from datetime import datetime
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
    client.close()
