from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import get_db, engine, Base
import models 

# Cria tabelas
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DTOs
from pydantic import BaseModel
from typing import List, Optional

class RoomCreate(BaseModel):
    name: str
    area: float
    urgency: str
    observations: str = ""

class ProjectCreate(BaseModel):
    client: dict 
    project: dict 
    rooms: List[RoomCreate]

@app.post("/projects/full")
def create_full_project(data: ProjectCreate, db: Session = Depends(get_db)):
    # 1. Cria Cliente
    # Safe get para evitar erros se campos faltarem
    db_client = models.Client(
        name=data.client.get("name"),
        phone=data.client.get("phone"),
        email=data.client.get("email"),
        cpf=data.client.get("cpf"),
        origin=data.client.get("origin"),
        store_unit=data.client.get("store_unit"),
        salesperson=data.client.get("salesperson"),
        address=data.client.get("address", "")
    )
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    # 2. Cria Projeto
    db_project = models.Project(
        property_type=data.project.get("property_type"),
        budget_expectation=data.project.get("budget_expectation"),
        move_in_date=data.project.get("move_in_date"),
        client_id=db_client.id,
        name=f"Projeto {db_client.name}" # Nome default
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # 3. Cria Ambientes
    for room in data.rooms:
        db_room = models.Room(
            name=room.name,
            area=room.area,
            urgency=room.urgency,
            observations=room.observations,
            project_id=db_project.id
        )
        db.add(db_room)
    
    db.commit()
    return {"status": "ok", "project_id": db_project.id}

@app.get("/kanban")
def get_kanban(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    
    result = []
    for p in projects:
        # Serialização manual simples
        p_dict = {
            "id": p.id,
            "clientName": p.client.name if p.client else f"Projeto {p.id}",
            "stageId": str(p.current_stage_id),
            "subStage": p.current_sub_stage,
             # Mock fields for UI compatibility if needed or real if added
            "owner": p.client.salesperson if p.client else "Vendas",
            "daysLeft": 5, # Mock SLA logic
            "urgency": "Normal", # Mock urgency logic derived from rooms?
            "area": sum([r.area for r in p.rooms]) if p.rooms else 0
        }
        result.append(p_dict)
        
    return result

@app.on_event("startup")
def startup_event():
    # Seed se necessário
    pass
