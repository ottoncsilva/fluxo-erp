from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, Date, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String)
    address = Column(String)
    email = Column(String)
    
    # Campos ITPP (Briefing)
    origin = Column(String)  # Ex: "Instagram", "Indicação"
    architect_contact = Column(String)
    pain_points = Column(Text)
    budget_expectation = Column(Float)
    move_in_date = Column(Date)

    projects = relationship("Project", back_populates="client")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    name = Column(String) # Ex: "Apto Inteiro - Ed. Horizon"
    status = Column(String, default="Em Andamento") # "Em Andamento", "Concluído", "Cancelado"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Chave estrangeira para a etapa atual global do projeto (opcional, pois rooms tem stage)
    # Mas útil para visão macro
    current_global_stage_id = Column(Integer, ForeignKey("workflow_config.id"), nullable=True)

    client = relationship("Client", back_populates="projects")
    rooms = relationship("Room", back_populates="project")
    batches = relationship("ProjectBatch", back_populates="project")

class WorkflowConfig(Base):
    __tablename__ = "workflow_config"

    id = Column(Integer, primary_key=True, index=True)
    stage_code = Column(String, unique=True)  # Ex: "1.1", "4.4A"
    stage_name = Column(String)              # Ex: "Briefing e Qualificação"
    stage_category = Column(String)          # Ex: "1. Pré-Venda", "4. Executivo"
    owner_role = Column(String)              # Ex: "Vendedor", "Projetista", "Medidor"
    sla_days = Column(Integer, default=0)    
    is_active = Column(Boolean, default=True)

    rooms = relationship("Room", back_populates="current_stage")

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String) # Ex: "Cozinha", "Dormitório"
    area_sqm = Column(Float)
    urgency_level = Column(String) # "Baixa", "Média", "Alta"
    observations = Column(Text)
    
    # Onde este ambiente está no fluxo?
    current_stage_id = Column(Integer, ForeignKey("workflow_config.id"))

    project = relationship("Project", back_populates="rooms")
    current_stage = relationship("WorkflowConfig", back_populates="rooms")
    batch_id = Column(Integer, ForeignKey("project_batches.id"), nullable=True)
    batch = relationship("ProjectBatch", back_populates="rooms")

class ProjectBatch(Base):
    __tablename__ = "project_batches"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    batch_name = Column(String) # Ex: "Lote 1 - Área Social"
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="batches")
    rooms = relationship("Room", back_populates="batch")
