from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    cpf = Column(String, nullable=True)
    phone = Column(String)
    email = Column(String)
    address = Column(String)
    # Campos de Contexto (ITPP)
    origin = Column(String)  # Instagram, Indicação...
    store_unit = Column(String) # Matriz, Filial...
    salesperson = Column(String) # Vendedor Dono

    projects = relationship("Project", back_populates="client")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    name = Column(String, nullable=True) # Adicionado para compatibilidade
    status = Column(String, default="Pré-Venda")
    
    # Dados ITPP do Projeto
    property_type = Column(String) # Casa/Apto
    move_in_date = Column(String, nullable=True)
    budget_expectation = Column(Float, default=0.0)
    
    # Novos Campos Solicitados
    property_status = Column(String) # "Na Planta/Obra", "Pronto/Entregue"
    purchase_moment = Column(String) # "Imediata", "Futura"

    
    # Controle de Fluxo
    current_stage_id = Column(String, default="1") # 1, 2, 4.1...
    current_sub_stage = Column(String, default="1.1")
    stage_entry_date = Column(DateTime(timezone=True), server_default=func.now())
    
    client = relationship("Client", back_populates="projects")
    rooms = relationship("Room", back_populates="project")
    batches = relationship("ProjectBatch", back_populates="project")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String) # Cozinha, Quarto...
    area = Column(Float)
    urgency = Column(String) # Alta, Normal
    observations = Column(Text)
    
    # Status Individual (Para o Split)
    status = Column(String, default="Pendente") # Pendente, Medido, Produção...
    
    project = relationship("Project", back_populates="rooms")
    batch_id = Column(Integer, ForeignKey("project_batches.id"), nullable=True)
    batch = relationship("ProjectBatch", back_populates="batch_rooms")

class ProjectBatch(Base):
    __tablename__ = "project_batches"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    batch_name = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    project = relationship("Project", back_populates="batches")
    batch_rooms = relationship("Room", back_populates="batch")

class WorkflowConfig(Base):
    __tablename__ = "workflow_config"
    id = Column(Integer, primary_key=True, index=True)
    stage_code = Column(String, unique=True)
    stage_name = Column(String)
    stage_category = Column(String)
    owner_role = Column(String)
    sla_days = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
