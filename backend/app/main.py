# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .routers import tasks
import os

# Create database tables on startup if they don't exist
# This is okay for development/simple apps. For production, use Alembic migrations.
create_db_and_tables()

app = FastAPI(title="Task Board API")

# CORS Configuration
origins = [
    "https://trello-clone-app-cyan.vercel.app", 
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Task Board API"}

# Optional: Add initial data if DB is empty
# from sqlalchemy.orm import Session
# from .database import SessionLocal, engine
# from . import crud, schemas, models
#
# def init_db():
#     db = SessionLocal()
#     if not crud.get_tasks(db):
#         print("Adding initial data...")
#         crud.create_task(db, schemas.TaskCreate(title="First Task", description="My first task description", status=models.TaskStatus.TO_DO))
#         crud.create_task(db, schemas.TaskCreate(title="Second Task", description="Another one", status=models.TaskStatus.IN_PROGRESS))
#     db.close()
#
# init_db() # Call this after create_db_and_tables() or on app startup event