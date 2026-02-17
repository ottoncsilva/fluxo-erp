from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    address = Column(String)
    # ITPP fields stored as JSON
    # origin, architect_contact, pain_points, budget_expectation, move_in_date
    itpp_data = Column(JSON, default={})

    projects = relationship("Project", back_populates="client")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    status = Column(String, default="Em Andamento")
    total_value = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="projects")
    stages = relationship("ProjectStage", back_populates="project")

class ProjectStage(Base):
    __tablename__ = "project_stages"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    stage_name = Column(String) # Ex: "Cozinha"
    current_sub_stage_id = Column(String) # Ex: "1.1"
    sla_deadline = Column(DateTime(timezone=True), nullable=True)

    project = relationship("Project", back_populates="stages")

class WorkflowConfig(Base):
    __tablename__ = "workflow_config"

    id = Column(Integer, primary_key=True, index=True)
    stage_number = Column(Integer) # 1, 2, 3...
    sub_stage_number = Column(String, unique=True, index=True) # "1.1", "1.2"...
    name = Column(String) # "Briefing"
    owner_role = Column(String) # "Vendedor"
    sla_days = Column(Integer) # 1
