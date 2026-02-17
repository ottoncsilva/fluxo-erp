from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Client Schemas ---
class ClientBase(BaseModel):
    name: str
    phone: str
    address: Optional[str] = None
    itpp_data: Optional[Dict[str, Any]] = {}

class ClientCreate(ClientBase):
    pass

class Client(ClientBase):
    id: int
    
    class Config:
        orm_mode = True

# --- Project Schemas ---
class ProjectBase(BaseModel):
    status: str = "Em Andamento"
    total_value: float = 0.0

class ProjectCreate(ProjectBase):
    client_id: int

class ProjectStageBase(BaseModel):
    stage_name: str
    current_sub_stage_id: str
    sla_deadline: Optional[datetime] = None

class ProjectStage(ProjectStageBase):
    id: int
    project_id: int

    class Config:
        orm_mode = True

class Project(ProjectBase):
    id: int
    created_at: Optional[datetime]
    client: Client
    stages: List[ProjectStage] = []

    class Config:
        orm_mode = True

class ProjectCreateRequest(BaseModel):
    client: ClientCreate
    project: ProjectBase

# --- Workflow Config Schema ---
class WorkflowConfig(BaseModel):
    id: int
    stage_number: int
    sub_stage_number: str
    name: str
    owner_role: str
    sla_days: int

    class Config:
        orm_mode = True
