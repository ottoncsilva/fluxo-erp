from database import SessionLocal, engine as db_engine
from models import WorkflowConfig, Base

# Garante que as tabelas existem
Base.metadata.create_all(bind=db_engine)

def seed_workflow():
    db = SessionLocal()
    
    # Lista Completa do Workflow conforme SPEC.md
    initial_stages = [
        # Etapa 1: Pré-Venda
        {"code": "1.1", "name": "Briefing e Qualificação", "category": "1. Pré-Venda", "role": "Vendedor", "sla": 1},
        {"code": "1.2", "name": "Visita Showroom", "category": "1. Pré-Venda", "role": "Vendedor", "sla": 1},
        {"code": "1.3", "name": "Follow Up", "category": "1. Pré-Venda", "role": "Vendedor", "sla": 5},
        
        # Etapa 2: Venda / Projeto
        {"code": "2.1", "name": "Projetar Ambientes", "category": "2. Venda / Projeto", "role": "Projetista", "sla": 1},
        {"code": "2.2", "name": "Projetar Mobiliário", "category": "2. Venda / Projeto", "role": "Projetista", "sla": 4},
        {"code": "2.3", "name": "Orçamento", "category": "2. Venda / Projeto", "role": "Projetista", "sla": 0},
        {"code": "2.4", "name": "Renderização", "category": "2. Venda / Projeto", "role": "Projetista", "sla": 1},
        {"code": "2.5", "name": "Apresentação", "category": "2. Venda / Projeto", "role": "Vendedor", "sla": 0},
        {"code": "2.6", "name": "Ajuste de Proposta", "category": "2. Venda / Projeto", "role": "Projetista", "sla": 3},
        {"code": "2.9", "name": "Detalhamento Contrato", "category": "2. Venda / Projeto", "role": "Vendedor", "sla": 1},
        {"code": "2.10", "name": "Aprovação Final", "category": "2. Venda / Projeto", "role": "Vendedor", "sla": 2},

        # Etapa 3: Medição (Split Point)
        {"code": "3.1", "name": "Agendamento", "category": "3. Medição", "role": "Medidor", "sla": 0},
        {"code": "3.2", "name": "Execução in Loco", "category": "3. Medição", "role": "Medidor", "sla": 1},

        # Etapa 4: Executivo
        {"code": "4.1", "name": "Construção Ambientes", "category": "4. Executivo", "role": "Liberador", "sla": 1},
        {"code": "4.2", "name": "Alinhamento Vendas", "category": "4. Executivo", "role": "Vendedor", "sla": 1},
        {"code": "4.3", "name": "Construção Mobiliário", "category": "4. Executivo", "role": "Liberador", "sla": 4},
        {"code": "4.4A", "name": "Aprovação Financeira", "category": "4. Executivo", "role": "Financeiro", "sla": 2},
        {"code": "4.4B", "name": "Detalhamento Executivo", "category": "4. Executivo", "role": "Liberador", "sla": 3},
        {"code": "4.4C", "name": "Aprovação Cliente", "category": "4. Executivo", "role": "Vendedor", "sla": 2},

        # Etapa 5: Fabricação
        {"code": "5.1", "name": "Implantação/Pedido", "category": "5. Fabricação", "role": "Financeiro", "sla": 1},
        {"code": "5.2", "name": "Produção Indústria", "category": "5. Fabricação", "role": "Indústria", "sla": 26},

        # Etapa 6: Entrega
        {"code": "6.1", "name": "Verificação Pré-Montagem", "category": "6. Entrega", "role": "Coord. Montagem", "sla": 2},
        {"code": "6.3", "name": "Transporte", "category": "6. Entrega", "role": "Equipe Entrega", "sla": 5},

        # Etapa 7: Montagem
        {"code": "7.1", "name": "Execução Montagem", "category": "7. Montagem", "role": "Equipe Montagem", "sla": 3},
        {"code": "7.2", "name": "Checklist Final", "category": "7. Montagem", "role": "Coord. Montagem", "sla": 1},

        # Etapa 8: Pós-Montagem
        {"code": "8.1", "name": "Solicitação Peças", "category": "8. Reposição", "role": "Liberador", "sla": 2},
        {"code": "8.2", "name": "Fabricação Reposição", "category": "8. Reposição", "role": "Indústria", "sla": 15},
        {"code": "8.4", "name": "Instalação", "category": "8. Reposição", "role": "Equipe Montagem", "sla": 7},

        # Etapa 9: Concluído
        {"code": "9.0", "name": "Projeto Concluído", "category": "9. Concluído", "role": "Sistema", "sla": 0},

        # Etapa 10: Assistência Técnica
        {"code": "10.0", "name": "Vistoria Técnica", "category": "10. Assistência", "role": "Supervisor", "sla": 3},
        {"code": "10.1", "name": "Solicitação Peças", "category": "10. Assistência", "role": "Liberador", "sla": 2},
        {"code": "10.2", "name": "Fabricação", "category": "10. Assistência", "role": "Indústria", "sla": 15},
    ]

    print("--- Iniciando Seed do Workflow ---")
    for stage_data in initial_stages:
        # Verifica se já existe pelo código (ex: "1.1")
        exists = db.query(WorkflowConfig).filter_by(stage_code=stage_data["code"]).first()
        
        if not exists:
            new_stage = WorkflowConfig(
                stage_code=stage_data["code"],
                stage_name=stage_data["name"],
                stage_category=stage_data["category"],
                owner_role=stage_data["role"],
                sla_days=stage_data["sla"]
            )
            db.add(new_stage)
            print(f"Criado: [{stage_data['code']}] {stage_data['name']}")
        else:
            # Opcional: Atualizar dados se mudou no SPEC (Update on Conflict)
            exists.stage_name = stage_data["name"]
            exists.stage_category = stage_data["category"]
            exists.owner_role = stage_data["role"]
            exists.sla_days = stage_data["sla"]
            print(f"Atualizado: [{stage_data['code']}] {stage_data['name']}")

    db.commit()
    print("--- Seed Concluído com Sucesso ---")
    db.close()

if __name__ == "__main__":
    seed_workflow()
