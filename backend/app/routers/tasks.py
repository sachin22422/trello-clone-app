# backend/app/routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas # or ..crud, ..models, ..schemas if schemas.py
from ..database import get_db

router = APIRouter(
    prefix="/api/tasks",
    tags=["tasks"],
)

@router.post("/", response_model=schemas.Task) # use schemas.Task
def create_task_endpoint(task: schemas.TaskCreate, db: Session = Depends(get_db)): # use schemas.TaskCreate
    return crud.create_task(db=db, task=task)

@router.get("/", response_model=List[schemas.Task]) # use schemas.Task
def read_tasks_endpoint(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tasks = crud.get_tasks(db, skip=skip, limit=limit)
    return tasks

@router.get("/{task_id}", response_model=schemas.Task) # use schemas.Task
def read_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    db_task = crud.get_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.put("/{task_id}", response_model=schemas.Task) # use schemas.Task
def update_task_endpoint(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db)): # use schemas.TaskUpdate
    db_task = crud.update_task(db, task_id=task_id, task_update=task_update)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.delete("/{task_id}", response_model=schemas.Task) # use schemas.Task
def delete_task_endpoint(task_id: int, db: Session = Depends(get_db)):
    db_task = crud.delete_task(db, task_id=task_id)
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task