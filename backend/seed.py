from database import SessionLocal, engine as db_engine
from models import WorkflowConfig, Base

# Initialize DB tables if they don't exist
Base.metadata.create_all(bind=db_engine)

def seed_workflow():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(WorkflowConfig).count() > 0:
        print("WorkflowConfig already allocated. Skipping seed.")
        db.close()
        return

    workflow_data = [
        # 1. Pre-Venda
        {"stage": 1, "sub": "1.1", "name": "Briefing", "owner": "Vendedor", "sla": 1},
        {"stage": 1, "sub": "1.2", "name": "Visita Showroom", "owner": "Vendedor", "sla": 1},
        {"stage": 1, "sub": "1.3", "name": "Follow Up", "owner": "Vendedor", "sla": 5},
        
        # 2. Venda
        {"stage": 2, "sub": "2.1", "name": "Projetar Ambientes", "owner": "Projetista", "sla": 1},
        {"stage": 2, "sub": "2.2", "name": "Projetar Mobiliário", "owner": "Projetista", "sla": 4},
        {"stage": 2, "sub": "2.5", "name": "Apresentação", "owner": "Vendedor", "sla": 0},
        {"stage": 2, "sub": "2.6", "name": "Ajuste", "owner": "Projetista", "sla": 3},
        {"stage": 2, "sub": "2.9", "name": "Detalhamento", "owner": "Vendedor", "sla": 1},

        # 3. Medicao
        {"stage": 3, "sub": "3.1", "name": "Agendamento", "owner": "Medidor", "sla": 0},
        {"stage": 3, "sub": "3.2", "name": "Execução", "owner": "Medidor", "sla": 1},

        # 4. Executivo
        {"stage": 4, "sub": "4.1", "name": "Const. Ambientes", "owner": "Liberador", "sla": 1},
        {"stage": 4, "sub": "4.2", "name": "Alinhamento", "owner": "Vendedor", "sla": 1},
        {"stage": 4, "sub": "4.3", "name": "Const. Mobiliário", "owner": "Liberador", "sla": 4},
        {"stage": 4, "sub": "4.4(A)", "name": "Aprov. Financeira", "owner": "Financeiro", "sla": 2},
        {"stage": 4, "sub": "4.4(B)", "name": "Detalhamento", "owner": "Liberador", "sla": 3},
        {"stage": 4, "sub": "4.4(C)", "name": "Aprov. Final", "owner": "Vendedor", "sla": 2},

        # 5. Fabricacao
        {"stage": 5, "sub": "5.1", "name": "Implantação", "owner": "Financeiro", "sla": 1},
        {"stage": 5, "sub": "5.2", "name": "Produção", "owner": "Indústria", "sla": 26},

        # 6. Entrega
        {"stage": 6, "sub": "6.1", "name": "Pré-Montagem", "owner": "Coord. Montagem", "sla": 2},
        {"stage": 6, "sub": "6.3", "name": "Transporte", "owner": "Equipe Entrega", "sla": 5},

        # 7. Montagem
        {"stage": 7, "sub": "7.1", "name": "Execução", "owner": "Equipe Montagem", "sla": 3},
        {"stage": 7, "sub": "7.2", "name": "Checklist", "owner": "Coord. Montagem", "sla": 1},

        # 8. Pos-Montagem
        {"stage": 8, "sub": "8.1", "name": "Solicitação", "owner": "Liberador", "sla": 2},
        {"stage": 8, "sub": "8.2", "name": "Fabricação", "owner": "Indústria", "sla": 15},
        {"stage": 8, "sub": "8.4", "name": "Instalação", "owner": "Equipe Montagem", "sla": 7},

        # 10. Assistencia Tecnica (Pulei 9 pq era Concluido sem subetapas explicitas no spec com SLA)
        {"stage": 10, "sub": "10.0", "name": "Vistoria", "owner": "Supervisor", "sla": 3},
        {"stage": 10, "sub": "10.1", "name": "Solicitação", "owner": "Liberador", "sla": 2},
        {"stage": 10, "sub": "10.2", "name": "Fabricação", "owner": "Indústria", "sla": 15},
    ]

    for item in workflow_data:
        wf = WorkflowConfig(
            stage_number=item["stage"],
            sub_stage_number=item["sub"],
            name=item["name"],
            owner_role=item["owner"],
            sla_days=item["sla"]
        )
        db.add(wf)
    
    db.commit()
    print("WorkflowConfig seeded successfully.")
    db.close()

if __name__ == "__main__":
    seed_workflow()
