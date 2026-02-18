from fastapi import FastAPI, Depends, HTTPException, status
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from database import get_db, engine, Base
import models 
import auth

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
def create_full_project(data: ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
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
        property_status=data.project.get("property_status"), # Novo
        purchase_moment=data.project.get("purchase_moment"), # Novo
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
            area_sqm=room.area,
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
            "area": sum([r.area_sqm for r in p.rooms]) if p.rooms else 0
        }
        result.append(p_dict)
        
    return result

@app.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    # Retorna estrutura completa necessária para o novo frontend
    result = []
    for p in projects:
        p_dict = {
            "id": p.id,
            "client_name": p.client.name if p.client else None,
            "client": {
                "id": p.client.id,
                "name": p.client.name,
                "phone": p.client.phone,
                "email": p.client.email,
                "address": p.client.address,
                "origin": p.client.origin
            } if p.client else None,
            "created_at": p.entry_date.isoformat() if hasattr(p, 'entry_date') and p.entry_date else None,
            "budget_expectation": p.budget_expectation,
            "move_in_date": p.move_in_date,
            "rooms": [
                {
                    "id": r.id,
                    "name": r.name,
                    "area_sqm": r.area_sqm,
                    "urgency_level": r.urgency,
                    "observations": r.observations
                } for r in p.rooms
            ]
        }
        result.append(p_dict)
    return result


# Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

@app.on_event("startup")
def startup_event():
    # Seed / Repair Admin
    db = Session(bind=engine)
    admin_email = "ottonsilva@gmail.com"
    default_pass = "123456"
    
    user = db.query(models.User).filter(models.User.email == admin_email).first()
    
    try:
        if not user:
            print(f"--- Criando Admin: {admin_email} ---")
            user = models.User(
                email=admin_email,
                hashed_password=auth.get_password_hash(default_pass),
                full_name="Otton Silva (Admin)",
                role="admin"
            )
            db.add(user)
            db.commit()
        else:
            # Check & Repair
            # Simplificação: Sempre reseta hash se a flag de debug estiver ativa ou apenas confia na verificação
            # Para garantir: Vamos verificar e se falhar, atualizar.
            if not auth.verify_password(default_pass, user.hashed_password):
                print(f"--- Corrigindo senha do Admin: {admin_email} ---")
                user.hashed_password = auth.get_password_hash(default_pass)
                db.commit()
    except Exception as e:
        print(f"Erro no startup seed: {e}")
            
    db.close()

@app.post("/auth/login")
async def login_json(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == data.email).first()
    if not user or not auth.verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user": {
            "name": user.full_name, 
            "email": user.email, 
            "role": user.role
        }
    }

@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": user.full_name, "email": user.email, "role": user.role}}
