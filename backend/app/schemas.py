# backend/app/schemas.py
from pydantic import BaseModel
from typing import Optional
from .models import TaskStatus # Assuming TaskStatus enum is in models.py

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TO_DO

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None

class Task(TaskBase):
    id: int

    class Config:
        from_attributes = True # Pydantic V2
        # orm_mode = True # Pydantic V1