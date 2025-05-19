# backend/app/crud.py
from sqlalchemy.orm import Session
from . import models, schemas # if schemas.py exists, else just models

def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def get_tasks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Task).offset(skip).limit(limit).all()

def create_task(db: Session, task: schemas.TaskCreate): # use schemas.TaskCreate
    db_task = models.Task(**task.model_dump()) # Pydantic v2
    # db_task = models.Task(**task.dict()) # Pydantic v1
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task(db: Session, task_id: int, task_update: schemas.TaskUpdate): # use schemas.TaskUpdate
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    update_data = task_update.model_dump(exclude_unset=True) # Pydantic v2
    # update_data = task_update.dict(exclude_unset=True) # Pydantic v1
    for key, value in update_data.items():
        setattr(db_task, key, value)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def delete_task(db: Session, task_id: int):
    db_task = get_task(db, task_id)
    if not db_task:
        return None
    db.delete(db_task)
    db.commit()
    return db_task