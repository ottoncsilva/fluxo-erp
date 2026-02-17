from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database import engine, get_db, Base
import models
import schemas
from seed import seed_workflow

app = FastAPI(title="Fluxo Planejados ERP")

# Create tables
Base.metadata.create_all(bind=engine)

@app.on_event("startup")
def on_startup():
    try:
        seed_workflow()
    except Exception as e:
        print(f"Error seeding database: {e}")

# --- Clients ---
@app.post("/clients/", response_model=schemas.Client)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.get("/clients/", response_model=List[schemas.Client])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clients = db.query(models.Client).offset(skip).limit(limit).all()
    return clients

# --- Projects ---
@app.post("/projects/", response_model=schemas.Project)
def create_project(request: schemas.ProjectCreateRequest, db: Session = Depends(get_db)):
    # 1. Create Client
    db_client = models.Client(**request.client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)

    # 2. Create Project
    db_project = models.Project(
        client_id=db_client.id,
        status="Em Andamento",
        total_value=request.project.total_value
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    # 3. Create Initial Stage (We need to populate all stages logic here later, 
    # for now getting the first one from workflow)
    # Ideally, a project starts at 1.1 Briefing
    
    # Get first workflow step
    first_step = db.query(models.WorkflowConfig).filter(models.WorkflowConfig.sub_stage_number == "1.1").first()
    
    if first_step:
        deadline = datetime.now() + timedelta(days=first_step.sla_days)
        stage = models.ProjectStage(
            project_id=db_project.id,
            stage_name=first_step.name,
            current_sub_stage_id=first_step.sub_stage_number,
            sla_deadline=deadline
        )
        db.add(stage)
        db.commit()

    db.refresh(db_project)
    return db_project

@app.get("/projects/", response_model=List[schemas.Project])
def read_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects

@app.get("/workflow/", response_model=List[schemas.WorkflowConfig])
def get_workflow(db: Session = Depends(get_db)):
    return db.query(models.WorkflowConfig).order_by(models.WorkflowConfig.id).all()

# --- Logic to Move Project Stage ---
@app.post("/projects/{project_id}/advance")
def advance_project_stage(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Assuming single active stage logic for simplicity in MVP
    current_stage = db.query(models.ProjectStage).filter(models.ProjectStage.project_id == project.id).order_by(models.ProjectStage.id.desc()).first()
    
    if not current_stage:
        raise HTTPException(status_code=400, detail="Project has no active stage")

    # Find next step in workflow
    current_wf = db.query(models.WorkflowConfig).filter(models.WorkflowConfig.sub_stage_number == current_stage.current_sub_stage_id).first()
    if not current_wf:
        raise HTTPException(status_code=500, detail="Current workflow stage not found in config")

    # This is a bit simplistic: finding the next ID. 
    # A better way would be order by stage_number, sub_stage_number
    # Since IDs are sequential in seed, we can try next ID.
    next_wf = db.query(models.WorkflowConfig).filter(models.WorkflowConfig.id > current_wf.id).order_by(models.WorkflowConfig.id).first()

    if next_wf:
        # Update current stage or create new one?
        # For traceablity, let's update the current stage record to "Done" (if we had history) 
        # or just update the pointer. MVP: Update pointer.
        
        current_stage.stage_name = next_wf.name
        current_stage.current_sub_stage_id = next_wf.sub_stage_number
        current_stage.sla_deadline = datetime.now() + timedelta(days=next_wf.sla_days)
        db.commit()
        return {"status": "advanced", "new_stage": next_wf.sub_stage_number}
    else:
        # End of workflow
        project.status = "Concluído"
        db.commit()
        return {"status": "completed"}
