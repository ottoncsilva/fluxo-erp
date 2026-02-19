import os
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from database import engine, SessionLocal
import models
import auth
from pydantic import BaseModel
from typing import Optional, List
import datetime

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ─── STARTUP SEED ───────────────────────────────────────────
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    admin_email = os.getenv("ADMIN_EMAIL", "ottonsilva@gmail.com")
    default_pass = os.getenv("ADMIN_PASSWORD", "123456")
    try:
        user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not user:
            user = models.User(
                email=admin_email,
                hashed_password=auth.get_password_hash(default_pass),
                full_name="Otton Silva",
                role="Admin"
            )
            db.add(user)
            db.commit()
        else:
            if not auth.verify_password(default_pass, user.hashed_password):
                user.hashed_password = auth.get_password_hash(default_pass)
                db.commit()
        # Seed company settings if not exists
        settings = db.query(models.CompanySettings).first()
        if not settings:
            db.add(models.CompanySettings(name="FluxoPlanejados"))
            db.commit()
    except Exception as e:
        print(f"Startup seed error: {e}")
    finally:
        db.close()

# ─── SCHEMAS ────────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class RoomCreate(BaseModel):
    name: str
    area_sqm: float
    urgency_level: Optional[str] = "Normal"
    estimated_value: Optional[float] = 0
    observations: Optional[str] = ""

class ClientCreate(BaseModel):
    name: str
    phone: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    status: Optional[str] = "Ativo"
    origin: Optional[str] = ""
    budget_expectation: Optional[float] = 0
    time_move_in: Optional[str] = None
    avatar: Optional[str] = None
    profile_pains: Optional[str] = None
    property_type: Optional[str] = None
    cpf: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    status: Optional[str] = None
    origin: Optional[str] = None
    budget_expectation: Optional[float] = None
    time_move_in: Optional[str] = None
    avatar: Optional[str] = None
    profile_pains: Optional[str] = None
    property_type: Optional[str] = None
    cpf: Optional[str] = None

class ProjectFullCreate(BaseModel):
    client: ClientCreate
    environments: List[RoomCreate]
    seller_name: Optional[str] = None

class NoteCreate(BaseModel):
    content: str
    author_id: Optional[str] = "sys"
    author_name: Optional[str] = "Sistema"
    note_type: Optional[str] = "MANUAL"

class EnvironmentUpdate(BaseModel):
    name: Optional[str] = None
    area_sqm: Optional[float] = None
    urgency_level: Optional[str] = None
    estimated_value: Optional[float] = None
    observations: Optional[str] = None
    status: Optional[str] = None

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "Vendedor"
    avatar: Optional[str] = None
    contract_type: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    avatar: Optional[str] = None
    contract_type: Optional[str] = None
    is_active: Optional[bool] = None

class CompanySettingsUpdate(BaseModel):
    name: Optional[str] = None
    cnpj: Optional[str] = None
    corporate_name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    social_media: Optional[str] = None
    logo_url: Optional[str] = None

class WorkflowSlaUpdate(BaseModel):
    step_id: str
    sla_days: int

class AssistanceCreate(BaseModel):
    client_name: str
    client_phone: Optional[str] = None
    project_id: Optional[int] = None
    description: str
    status: Optional[str] = "ABERTURA"
    current_step: Optional[str] = "ABERTURA"

class AssistanceUpdate(BaseModel):
    status: Optional[str] = None
    current_step: Optional[str] = None
    description: Optional[str] = None

class FactoryOrderCreate(BaseModel):
    environment_id: str
    environment_name: str
    part_description: str

# ─── AUTH ───────────────────────────────────────────────────
@app.post("/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not auth.verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "name": user.full_name,
            "email": user.email,
            "role": user.role,
            "avatar": user.avatar,
            "contract_type": user.contract_type,
            "isSystemUser": True,
            "password": ""
        }
    }

def get_current_user(token: str = Depends(auth.oauth2_scheme), db: Session = Depends(get_db)):
    email = auth.get_email_from_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Usuário não encontrado")
    return user

# ─── HELPERS ────────────────────────────────────────────────
def serialize_project(p: models.Project):
    return {
        "id": str(p.id),
        "client": {
            "id": str(p.client.id) if p.client else "",
            "name": p.client.name if p.client else "",
            "phone": p.client.phone or "",
            "email": p.client.email or "",
            "address": p.client.address or "",
            "status": p.client.status or "Ativo",
            "origin": p.client.origin or "",
            "budget_expectation": p.client.budget_expectation or 0,
            "time_move_in": p.client.time_move_in,
            "avatar": p.client.avatar,
            "profile_pains": p.client.profile_pains,
            "property_type": p.client.property_type,
            "cpf": p.client.cpf,
        } if p.client else {},
        "sellerName": p.seller_name or "",
        "created_at": p.entry_date.isoformat() if p.entry_date else "",
        "environments": [
            {
                "id": str(r.id),
                "name": r.name,
                "area_sqm": r.area_sqm,
                "urgency_level": r.urgency_level or r.urgency or "Normal",
                "estimated_value": r.estimated_value or 0,
                "observations": r.observations or "",
                "status": r.status or "InBatch",
                "version": r.version or 1,
            } for r in p.rooms
        ],
        "notes": [
            {
                "id": str(n.id),
                "content": n.content,
                "authorId": n.author_id,
                "authorName": n.author_name,
                "createdAt": n.created_at.isoformat() if n.created_at else "",
                "type": n.note_type,
            } for n in (p.notes or [])
        ],
        "factoryOrders": [
            {
                "id": str(fo.id),
                "environmentId": fo.environment_id,
                "environmentName": fo.environment_name,
                "partDescription": fo.part_description,
                "status": fo.status,
                "createdAt": fo.created_at.isoformat() if fo.created_at else "",
            } for fo in (p.factory_orders or [])
        ],
    }

def serialize_batch(b: models.ProjectBatch):
    return {
        "id": str(b.id),
        "projectId": str(b.project_id),
        "name": b.batch_name,
        "currentStepId": b.current_step_id,
        "environmentIds": [str(r.id) for r in b.batch_rooms],
        "createdAt": b.created_at.isoformat() if b.created_at else "",
        "lastUpdated": b.last_updated.isoformat() if b.last_updated else "",
    }

# ─── PROJECTS ───────────────────────────────────────────────
@app.get("/projects")
def get_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    projects = db.query(models.Project).all()
    batches = db.query(models.ProjectBatch).all()
    return {
        "projects": [serialize_project(p) for p in projects],
        "batches": [serialize_batch(b) for b in batches],
    }

@app.post("/projects/full")
def create_project_full(data: ProjectFullCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Create client
    client = models.Client(**data.client.dict())
    db.add(client)
    db.flush()

    # Create project
    project = models.Project(
        client_id=client.id,
        seller_name=data.seller_name or current_user.full_name,
        entry_date=datetime.datetime.utcnow(),
    )
    db.add(project)
    db.flush()

    # Initial note
    note = models.Note(
        project_id=project.id,
        content="Projeto iniciado.",
        author_id="sys",
        author_name="Sistema",
        note_type="SYSTEM"
    )
    db.add(note)

    # Create rooms
    room_ids = []
    for env in data.environments:
        room = models.Room(
            project_id=project.id,
            name=env.name,
            area_sqm=env.area_sqm,
            urgency_level=env.urgency_level or "Normal",
            urgency=env.urgency_level or "Normal",
            estimated_value=env.estimated_value or 0,
            observations=env.observations or "",
            status="InBatch",
            version=1,
        )
        db.add(room)
        db.flush()
        room_ids.append(room.id)

    # Create batch
    batch = models.ProjectBatch(
        project_id=project.id,
        batch_name="Projeto Completo",
        current_step_id="1.1",
    )
    db.add(batch)
    db.flush()

    # Link rooms to batch
    for room_id in room_ids:
        room = db.query(models.Room).filter(models.Room.id == room_id).first()
        room.batch_id = batch.id

    db.commit()
    db.refresh(project)
    return {"project": serialize_project(project), "batch": serialize_batch(batch)}

@app.post("/projects/{project_id}/notes")
def add_note(project_id: int, note_data: NoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    note = models.Note(
        project_id=project_id,
        content=note_data.content,
        author_id=note_data.author_id or str(current_user.id),
        author_name=note_data.author_name or current_user.full_name,
        note_type=note_data.note_type or "MANUAL"
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return {"id": str(note.id), "content": note.content, "authorId": note.author_id, "authorName": note.author_name, "createdAt": note.created_at.isoformat(), "type": note.note_type}

@app.patch("/projects/{project_id}/client")
def update_client(project_id: int, updates: ClientUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    for k, v in updates.dict(exclude_unset=True).items():
        setattr(project.client, k, v)
    note = models.Note(project_id=project_id, content="Dados cadastrais do cliente atualizados.", author_id=str(current_user.id), author_name=current_user.full_name, note_type="SYSTEM")
    db.add(note)
    db.commit()
    return {"ok": True}

@app.patch("/projects/{project_id}/environments/{env_id}")
def update_environment(project_id: int, env_id: int, updates: EnvironmentUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    room = db.query(models.Room).filter(models.Room.id == env_id, models.Room.project_id == project_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Ambiente não encontrado")
    for k, v in updates.dict(exclude_unset=True).items():
        setattr(room, k, v)
    db.commit()
    return {"ok": True}

@app.post("/projects/{project_id}/factory-order")
def request_factory(project_id: int, data: FactoryOrderCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    order = models.FactoryOrder(
        project_id=project_id,
        environment_id=data.environment_id,
        environment_name=data.environment_name,
        part_description=data.part_description,
        status="Solicitado"
    )
    db.add(order)
    note = models.Note(project_id=project_id, content=f"Peça solicitada para fábrica: {data.part_description}", author_id=str(current_user.id), author_name=current_user.full_name, note_type="SYSTEM")
    db.add(note)
    db.commit()
    return {"ok": True}

# ─── BATCHES ────────────────────────────────────────────────
WORKFLOW_ORDER = [
    '1.1','1.2','1.3',
    '2.1','2.2','2.3','2.4','2.5','2.6','2.7','2.8','2.9','2.10',
    '3.1','3.2',
    '4.1','4.2','4.3','4.4','4.5','4.6','4.7','4.8','4.9',
    '5.1','5.2',
    '6.1','6.2','6.3',
    '7.1','7.2',
    '8.1','8.2','8.3','8.4','8.5',
    '9.0'
]

@app.post("/batches/{batch_id}/advance")
def advance_batch(batch_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    batch = db.query(models.ProjectBatch).filter(models.ProjectBatch.id == batch_id).first()
    if not batch:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    try:
        idx = WORKFLOW_ORDER.index(batch.current_step_id)
    except ValueError:
        idx = 0
    if idx >= len(WORKFLOW_ORDER) - 1:
        raise HTTPException(status_code=400, detail="Já está na última etapa")
    next_step = WORKFLOW_ORDER[idx + 1]
    prev_step = batch.current_step_id
    batch.current_step_id = next_step
    batch.last_updated = datetime.datetime.utcnow()
    note = models.Note(
        project_id=batch.project_id,
        content=f"Etapa concluída: {prev_step} → {next_step}",
        author_id=str(current_user.id),
        author_name=current_user.full_name,
        note_type="SYSTEM"
    )
    db.add(note)
    db.commit()
    return serialize_batch(batch)

@app.post("/batches/{batch_id}/split")
def split_batch(batch_id: int, env_ids: List[str], db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    original = db.query(models.ProjectBatch).filter(models.ProjectBatch.id == batch_id).first()
    if not original:
        raise HTTPException(status_code=404, detail="Lote não encontrado")
    int_env_ids = [int(eid) for eid in env_ids]
    # New batch starting at 4.1
    new_batch = models.ProjectBatch(project_id=original.project_id, batch_name=f"Lote - {datetime.date.today()}", current_step_id="4.1")
    db.add(new_batch)
    db.flush()
    # Move rooms
    rooms_to_move = db.query(models.Room).filter(models.Room.id.in_(int_env_ids)).all()
    for room in rooms_to_move:
        room.batch_id = new_batch.id
    # Check if original batch has rooms left
    remaining = db.query(models.Room).filter(models.Room.batch_id == original.id).all()
    if not remaining:
        db.delete(original)
    note = models.Note(project_id=original.project_id, content=f"Lote separado criado na etapa Executivo com {len(int_env_ids)} ambientes.", author_id=str(current_user.id), author_name=current_user.full_name, note_type="SYSTEM")
    db.add(note)
    db.commit()
    return {"ok": True}

# ─── USERS ──────────────────────────────────────────────────
@app.get("/users")
def get_users(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    users = db.query(models.User).all()
    return [{"id": str(u.id), "name": u.full_name, "email": u.email, "role": u.role, "avatar": u.avatar, "contract_type": u.contract_type, "isSystemUser": True, "password": ""} for u in users]

@app.post("/users")
def create_user(data: UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.User).filter(models.User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    user = models.User(
        email=data.email,
        hashed_password=auth.get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role or "Vendedor",
        avatar=data.avatar,
        contract_type=data.contract_type,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": str(user.id), "name": user.full_name, "email": user.email, "role": user.role, "avatar": user.avatar, "contract_type": user.contract_type, "isSystemUser": True, "password": ""}

@app.patch("/users/{user_id}")
def update_user(user_id: int, data: UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    for k, v in data.dict(exclude_unset=True).items():
        if k == "password" and v:
            user.hashed_password = auth.get_password_hash(v)
        elif k != "password":
            if k == "full_name":
                user.full_name = v
            else:
                setattr(user, k, v)
    db.commit()
    return {"id": str(user.id), "name": user.full_name, "email": user.email, "role": user.role, "avatar": user.avatar, "contract_type": user.contract_type, "isSystemUser": True, "password": ""}

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    db.delete(user)
    db.commit()
    return {"ok": True}

# ─── CLIENTS ────────────────────────────────────────────────
@app.get("/clients")
def get_clients(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    clients = db.query(models.Client).all()
    return [{"id": str(c.id), "name": c.name, "phone": c.phone, "email": c.email, "address": c.address, "status": c.status, "origin": c.origin, "budget_expectation": c.budget_expectation, "time_move_in": c.time_move_in, "avatar": c.avatar, "profile_pains": c.profile_pains, "property_type": c.property_type, "cpf": c.cpf} for c in clients]

# ─── SETTINGS ───────────────────────────────────────────────
@app.get("/settings/company")
def get_company(db: Session = Depends(get_db)):
    s = db.query(models.CompanySettings).first()
    if not s:
        s = models.CompanySettings(name="FluxoPlanejados")
        db.add(s)
        db.commit()
        db.refresh(s)
    return {"name": s.name, "cnpj": s.cnpj, "corporateName": s.corporate_name, "address": s.address, "phone": s.phone, "socialMedia": s.social_media, "logoUrl": s.logo_url}

@app.put("/settings/company")
def update_company(data: CompanySettingsUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    s = db.query(models.CompanySettings).first()
    if not s:
        s = models.CompanySettings()
        db.add(s)
    if data.name is not None: s.name = data.name
    if data.cnpj is not None: s.cnpj = data.cnpj
    if data.corporate_name is not None: s.corporate_name = data.corporate_name
    if data.address is not None: s.address = data.address
    if data.phone is not None: s.phone = data.phone
    if data.social_media is not None: s.social_media = data.social_media
    if data.logo_url is not None: s.logo_url = data.logo_url
    db.commit()
    return {"ok": True}

@app.get("/settings/workflow")
def get_workflow(db: Session = Depends(get_db)):
    configs = db.query(models.WorkflowConfig).all()
    return [{"id": c.stage_code, "label": c.stage_name, "ownerRole": c.owner_role, "sla": c.sla_days} for c in configs]

@app.put("/settings/workflow/sla")
def update_workflow_sla(data: WorkflowSlaUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    config = db.query(models.WorkflowConfig).filter(models.WorkflowConfig.stage_code == data.step_id).first()
    if config:
        config.sla_days = data.sla_days
        db.commit()
    return {"ok": True}

# ─── ASSISTANCE ─────────────────────────────────────────────
@app.get("/assistance")
def get_assistance(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    tickets = db.query(models.AssistanceTicket).all()
    return [{"id": str(t.id), "clientName": t.client_name, "clientPhone": t.client_phone, "projectId": str(t.project_id) if t.project_id else None, "description": t.description, "status": t.status, "currentStep": t.current_step, "createdAt": t.created_at.isoformat(), "updatedAt": t.updated_at.isoformat()} for t in tickets]

@app.post("/assistance")
def create_assistance(data: AssistanceCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ticket = models.AssistanceTicket(**data.dict())
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return {"id": str(ticket.id), "clientName": ticket.client_name, "status": ticket.status, "createdAt": ticket.created_at.isoformat(), "updatedAt": ticket.updated_at.isoformat()}

@app.patch("/assistance/{ticket_id}")
def update_assistance(ticket_id: int, data: AssistanceUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    ticket = db.query(models.AssistanceTicket).filter(models.AssistanceTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket não encontrado")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(ticket, k, v)
    db.commit()
    return {"ok": True}
