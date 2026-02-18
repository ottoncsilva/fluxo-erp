from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from database import engine, get_db, Base
import models
from fastapi.middleware.cors import CORSMiddleware
import os

# Cria as tabelas se não existirem
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Fluxo Planejados ERP")

# Configuração CORS
origins = [
    "http://localhost:5173",
    "http://localhost:80",
    "http://localhost",
    "*", # Permite tudo para evitar dor de cabeça no MVP
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    from seed import seed_workflow
    try:
        seed_workflow()
        print("--- Seed Automático Executado ---")
    except Exception as e:
        print(f"Erro no Seed Automático: {e}")

# --- Schemas Pydantic (Simples para Leitura) ---
class WorkflowStage(BaseModel):
    id: int
    stage_code: str
    stage_name: str
    stage_category: str
    owner_role: str
    
    class Config:
        from_attributes = True

class RoomRead(BaseModel):
    id: int
    name: str
    current_stage_id: int
    
    class Config:
        from_attributes = True

class ProjectRead(BaseModel):
    id: int
    name: str
    client_name: str
    rooms: List[RoomRead] = []

    class Config:
        from_attributes = True

# --- Endpoints ---

@app.get("/")
def read_root():
    return {"message": "API Fluxo Planejados está ON! 🚀"}

@app.post("/seed")
def run_seed():
    from seed import seed_workflow
    try:
        seed_workflow()
        return {"message": "Seed executado com sucesso!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workflow", response_model=List[WorkflowStage])
def get_workflow(db: Session = Depends(get_db)):
    """Retorna todas as etapas para montar as colunas do Kanban"""
    return db.query(models.WorkflowConfig).order_by(models.WorkflowConfig.id).all()

@app.get("/projects", response_model=List[ProjectRead])
def get_projects(db: Session = Depends(get_db)):
    """Retorna projetos para o Kanban"""
    projects = db.query(models.Project).all()
    # Mockando client_name se não tiver join complexo ainda
    result = []
    for p in projects:
        p_dict = {
            "id": p.id,
            "name": p.name,
            "client_name": p.client.name if p.client else "Sem Cliente",
            "rooms": p.rooms
        }
        result.append(p_dict)
    return result

# Endpoint temporário para criar dados de teste
@app.post("/debug/create-dummy")
def create_dummy_data(db: Session = Depends(get_db)):
    # Verifica se já tem cliente
    if db.query(models.Client).count() == 0:
        c1 = models.Client(name="Ana Souza", phone="1199999999", origin="Instagram")
        db.add(c1)
        db.commit()
        
        p1 = models.Project(name="Apto 402 - Ed. Solaris", client_id=c1.id)
        db.add(p1)
        db.commit()
        
        # Pega ID da etapa 1.1
        stage_1_1 = db.query(models.WorkflowConfig).filter_by(stage_code="1.1").first()
        
        if stage_1_1:
            r1 = models.Room(name="Cozinha", project_id=p1.id, current_stage_id=stage_1_1.id)
            r2 = models.Room(name="Suíte Master", project_id=p1.id, current_stage_id=stage_1_1.id)
            db.add_all([r1, r2])
            db.commit()
            
        return {"message": "Dados de teste criados!"}
    return {"message": "Dados já existem."}
