# backend/app/models.py
from sqlalchemy import Column, Integer, String, Enum as SQLAlchemyEnum
from .database import Base
import enum

class TaskStatus(str, enum.Enum):
    TO_DO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    status = Column(SQLAlchemyEnum(TaskStatus), default=TaskStatus.TO_DO, nullable=False)
    # order = Column(Integer, default=0) # Optional: for ordering within columns