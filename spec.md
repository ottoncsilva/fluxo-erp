# ESPECIFICAÇÃO TÉCNICA - FLUXO PLANEJADOS ERP

## 1. Visão Geral
Sistema de gestão operacional para loja de móveis planejados.
Foco: Monitoramento de Prazos (SLA), Responsáveis (Donos) e Jornada do Cliente.
Arquitetura: Dockerizada (Pronta para Easypanel).

## 2. Tecnologias (Obrigatórias)
- Backend: Python FastAPI.
- Banco de Dados: PostgreSQL (SQLAlchemy).
- Frontend: React + Vite + TailwindCSS.
- Infra: Docker Compose (para rodar tudo junto).

## 3. Estrutura do Banco de Dados

### Tabela: Clients
- Campos: id, name, phone, address.
- Campos ITPP (Json): origin, architect_contact, pain_points, budget_expectation, move_in_date.

### Tabela: Projects
- Campos: id, client_id, status (ex: "Em Andamento"), total_value.

### Tabela: ProjectStages (Lotes)
- O projeto pode ser dividido. Cada "Lote" tem seu próprio status.
- Campos: id, project_id, stage_name (ex: "Cozinha"), current_sub_stage_id, sla_deadline.

### Tabela: WorkflowConfig (As Regras do PDF)
Esta tabela deve ser populada automaticamente (Seed) com estes dados fixos:

**1. Pré-Venda**
- `1.1 Briefing` (Dono: Vendedor | SLA: 1 Dia)
- `1.2 Visita Showroom` (Dono: Vendedor | SLA: 1 Dia)
- `1.3 Follow Up` (Dono: Vendedor | SLA: 5 Dias)

**2. Venda**
- `2.1 Projetar Ambientes` (Dono: Projetista | SLA: 1 Dia)
- `2.2 Projetar Mobiliário` (Dono: Projetista | SLA: 4 Dias)
- `2.5 Apresentação` (Dono: Vendedor | SLA: 0 Dias)
- `2.6 Ajuste` (Dono: Projetista | SLA: 3 Dias)
- `2.9 Detalhamento` (Dono: Vendedor | SLA: 1 Dia)

**3. Medição**
- `3.1 Agendamento` (Dono: Medidor | SLA: 0 Dias)
- `3.2 Execução` (Dono: Medidor | SLA: 1 Dia)

**4. Executivo**
- `4.1 Const. Ambientes` (Dono: Liberador | SLA: 1 Dia)
- `4.2 Alinhamento` (Dono: Vendedor | SLA: 1 Dia)
- `4.3 Const. Mobiliário` (Dono: Liberador | SLA: 4 Dias)
- `4.4(A) Aprov. Financeira` (Dono: Financeiro | SLA: 2 Dias)
- `4.4(B) Detalhamento` (Dono: Liberador | SLA: 3 Dias)
- `4.4(C) Aprov. Final` (Dono: Vendedor | SLA: 2 Dias)

**5. Fabricação**
- `5.1 Implantação` (Dono: Financeiro | SLA: 1 Dia)
- `5.2 Produção` (Dono: Indústria | SLA: 26 Dias)

**6. Entrega**
- `6.1 Pré-Montagem` (Dono: Coord. Montagem | SLA: 2 Dias)
- `6.3 Transporte` (Dono: Equipe Entrega | SLA: 5 Dias)

**7. Montagem**
- `7.1 Execução` (Dono: Equipe Montagem | SLA: 3 Dias)
- `7.2 Checklist` (Dono: Coord. Montagem | SLA: 1 Dia)

**8. Pós-Montagem**
- `8.1 Solicitação` (Dono: Liberador | SLA: 2 Dias)
- `8.2 Fabricação` (Dono: Indústria | SLA: 15 Dias)
- `8.4 Instalação` (Dono: Equipe Montagem | SLA: 7 Dias)

**9. Concluído**

**10. Assistência Técnica**
- `10.0 Vistoria` (Dono: Supervisor | SLA: 3 Dias)
- `10.1 Solicitação` (Dono: Liberador | SLA: 2 Dias)
- `10.2 Fabricação` (Dono: Indústria | SLA: 15 Dias)

## 4. Regras de Interface (Frontend)
1. **Kanban Horizontal:** 10 Colunas (Etapas).
2. **Sidebar de Filtro:** Ao clicar no título da coluna "Executivo", a barra lateral mostra as subetapas (4.1, 4.2...) para filtrar os cards.
3. **Card do Projeto:** Deve mostrar a FOTO do Dono da subetapa atual.
4. **Tela de Medição:** Um modal para selecionar quais ambientes avançam (Split) e quais ficam.