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
    origin = Column(String, nullable=True)
    store_unit = Column(String, nullable=True)
    salesperson = Column(String, nullable=True)
    status = Column(String, default="Ativo")
    budget_expectation = Column(Float, nullable=True)
    time_move_in = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    profile_pains = Column(Text, nullable=True)
    property_type = Column(String, nullable=True)

    projects = relationship("Project", back_populates="client")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="Vendedor")
    is_active = Column(Boolean, default=True)
    avatar = Column(String, nullable=True)
    contract_type = Column(String, nullable=True)  # PJ, CLT

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"))
    name = Column(String, nullable=True)
    status = Column(String, default="Pré-Venda")
    seller_name = Column(String, nullable=True)

    property_type = Column(String, nullable=True)
    move_in_date = Column(String, nullable=True)
    budget_expectation = Column(Float, default=0.0)
    property_status = Column(String, nullable=True)
    purchase_moment = Column(String, nullable=True)

    current_stage_id = Column(String, default="1")
    current_sub_stage = Column(String, default="1.1")
    entry_date = Column(DateTime(timezone=True), server_default=func.now())
    stage_entry_date = Column(DateTime(timezone=True), server_default=func.now())

    client = relationship("Client", back_populates="projects")
    rooms = relationship("Room", back_populates="project")
    batches = relationship("ProjectBatch", back_populates="project")
    notes = relationship("Note", back_populates="project", order_by="Note.created_at.desc()")
    factory_orders = relationship("FactoryOrder", back_populates="project")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    area_sqm = Column(Float)
    urgency = Column(String, default="Normal")
    urgency_level = Column(String, default="Normal")
    observations = Column(Text, nullable=True)
    status = Column(String, default="InBatch")
    estimated_value = Column(Float, nullable=True)
    version = Column(Integer, default=1)

    project = relationship("Project", back_populates="rooms")
    batch_id = Column(Integer, ForeignKey("project_batches.id"), nullable=True)
    batch = relationship("ProjectBatch", back_populates="batch_rooms")

class ProjectBatch(Base):
    __tablename__ = "project_batches"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    batch_name = Column(String, default="Projeto Completo")
    current_step_id = Column(String, default="1.1")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    project = relationship("Project", back_populates="batches")
    batch_rooms = relationship("Room", back_populates="batch")

class Note(Base):
    __tablename__ = "notes"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    content = Column(Text)
    author_id = Column(String, default="sys")
    author_name = Column(String, default="Sistema")
    note_type = Column(String, default="MANUAL")  # MANUAL, SYSTEM
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="notes")

class FactoryOrder(Base):
    __tablename__ = "factory_orders"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    environment_id = Column(String)
    environment_name = Column(String)
    part_description = Column(Text)
    status = Column(String, default="Solicitado")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    project = relationship("Project", back_populates="factory_orders")

class AssistanceTicket(Base):
    __tablename__ = "assistance_tickets"
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String)
    client_phone = Column(String, nullable=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=True)
    description = Column(Text)
    status = Column(String, default="ABERTURA")
    current_step = Column(String, default="ABERTURA")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class CompanySettings(Base):
    __tablename__ = "company_settings"
    id = Column(Integer, primary_key=True, default=1)
    name = Column(String, default="FluxoPlanejados")
    cnpj = Column(String, nullable=True)
    corporate_name = Column(String, nullable=True)
    address = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    social_media = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)

class WorkflowConfig(Base):
    __tablename__ = "workflow_config"
    id = Column(Integer, primary_key=True, index=True)
    stage_code = Column(String, unique=True)
    stage_name = Column(String)
    stage_category = Column(String, nullable=True)
    owner_role = Column(String, nullable=True)
    sla_days = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
