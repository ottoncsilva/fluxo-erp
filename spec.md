# ESPECIFICAÇÃO TÉCNICA - FLUXO PLANEJADOS ERP

## 1. Visão Geral
Sistema de gestão operacional para loja de móveis planejados (Revenda).
**Objetivo:** Monitorar a Jornada do Cliente, Prazos (SLA) e Responsáveis (Donos da Tarefa).
**Arquitetura:** Monorepo Dockerizado (Pronto para deploy em Easypanel/Hostinger).

## 2. Stack Tecnológica (Obrigatória)
- **Backend:** Python FastAPI (Async).
- **Banco de Dados:** PostgreSQL (Via SQLAlchemy + Alembic).
- **Frontend:** React + Vite + TailwindCSS + ShadcnUI.
- **Infra:** Docker Compose (Orquestração dos containers).

---

## 3. Estrutura do Banco de Dados (Schema)

### Tabela: Clients (Dados do Cliente + ITPP)
- `id`: Integer (PK)
- `name`: String
- `phone`: String
- `address`: String
- `email`: String
- **Campos ITPP (Briefing Obrigatório):**
  - [cite_start]`origin`: String (ex: "Porta de Loja", "Instagram", "Indicação Arquiteto") [cite: 7, 8]
  - [cite_start]`architect_contact`: String (Nome/Tel do Especificador) [cite: 17, 18]
  - [cite_start]`pain_points`: Text (Dores/Expectativas do cliente) [cite: 12]
  - [cite_start]`budget_expectation`: Float (Expectativa de Investimento) [cite: 30]
  - [cite_start]`move_in_date`: Date (Previsão de Mudança) [cite: 20]

### Tabela: Projects (O Contrato Global)
- `id`: Integer (PK)
- `client_id`: FK -> Clients
- `status`: String (ex: "Em Andamento", "Cancelado", "Concluído")
- `created_at`: DateTime

### Tabela: Rooms (Ambientes Detalhados - Baseado na Interface Visual)
*Cadastro inicial feito pelo projetista.*
- `id`: Integer (PK)
- `project_id`: FK -> Projects
- `name`: String (ex: "Cozinha", "Dormitório Casal")
- `area_sqm`: Float (Metragem Quadrada - m²)
- `urgency_level`: String (ex: "Baixa", "Média", "Alta")
- `observations`: Text (Detalhes técnicos específicos)
- `current_stage_id`: FK -> WorkflowConfig (Onde este ambiente está no fluxo)

### Tabela: ProjectBatches (Lotes de Produção - O "Split")
*Agrupa ambientes que avançam juntos para a fábrica.*
- `id`: Integer (PK)
- `project_id`: FK -> Projects
- `batch_name`: String (ex: "Lote 1 - Área Social")
- `created_at`: DateTime

---

## 4. Workflow & Seed Data (A "Bíblia" do Processo)
*O sistema DEVE rodar um script de SEED ao iniciar para popular estas etapas exatas no banco.*

**Legenda:** [Código] Nome da Subetapa (Dono Responsável | Prazo SLA em Dias Úteis)

**Etapa 1: Pré-Venda**
- `1.1` Briefing e Qualificação (Vendedor | 1 dia)
- `1.2` Visita Showroom (Vendedor | 1 dia)
- `1.3` Follow Up (Vendedor | 5 dias)

**Etapa 2: Venda / Projeto**
- `2.1` Projetar Ambientes (Projetista | 1 dia)
- `2.2` Projetar Mobiliário (Projetista | 4 dias)
- `2.3` Orçamento (Projetista | 0 dias - Imediato)
- `2.4` Renderização (Projetista | 1 dia)
- `2.5` Apresentação (Vendedor | 0 dias - Agendado)
- `2.6` Ajuste de Proposta (Projetista | 3 dias)
- `2.9` Detalhamento Contrato (Vendedor | 1 dia)
- `2.10` Aprovação Final (Vendedor | 2 dias)

**Etapa 3: Medição (Ponto de Cisão/Split)**
- `3.1` Agendamento (Medidor | 0 dias)
- `3.2` Execução in Loco (Medidor | 1 dia)

**Etapa 4: Executivo (Gargalo Técnico)**
- `4.1` Construção Ambientes (Liberador | 1 dia)
- `4.2` Alinhamento Vendas (Vendedor | 1 dia)
- `4.3` Construção Mobiliário (Liberador | 4 dias)
- `4.4A` Aprovação Financeira (Financeiro | 2 dias)
- `4.4B` Detalhamento Executivo (Liberador | 3 dias)
- `4.4C` Aprovação Cliente (Vendedor | 2 dias)

**Etapa 5: Fabricação**
- `5.1` Implantação/Pedido (Financeiro | 1 dia)
- `5.2` Produção Indústria (Indústria | 26 dias)

**Etapa 6: Entrega**
- `6.1` Verificação Pré-Montagem (Coord. Montagem | 2 dias)
- `6.3` Transporte (Equipe Entrega | 5 dias)

**Etapa 7: Montagem**
- `7.1` Execução Montagem (Equipe Montagem | 3 dias/ambiente)
- `7.2` Checklist Final (Coord. Montagem | 1 dia)

**Etapa 8: Pós-Montagem**
- `8.1` Solicitação Peças (Liberador | 2 dias)
- `8.2` Fabricação Reposição (Indústria | 15 dias)
- `8.4` Instalação (Equipe Montagem | 7 dias)

**Etapa 9: Concluído** (Fim do fluxo ativo)

**Etapa 10: Assistência Técnica**
- `10.0` Vistoria Técnica (Supervisor | 3 dias)
- `10.1` Solicitação Peças (Liberador | 2 dias)
- `10.2` Fabricação (Indústria | 15 dias)

---

## 5. Regras de Interface (Frontend)

### 1. Kanban Operacional (A Tela Principal)
- **Layout:** Rolagem horizontal com as 10 Colunas Fixas (Etapas).
- **Sidebar de Filtro (Contextual):**
  - Ao clicar no Cabeçalho da Coluna "4. Executivo", a barra lateral esquerda deve listar as subetapas (4.1, 4.2, 4.4A...).
  - O usuário clica na subetapa para filtrar os cards.
- **Card do Projeto:**
  - Deve exibir: Nome Cliente, Nome do Ambiente/Lote.
  - **Destaque:** Avatar do Dono da Subetapa atual (ex: Foto do Financeiro se estiver em 4.4A).
  - **SLA:** Badge colorido (Verde = No prazo, Vermelho = Atrasado).

### 2. Modal de Medição (O Splitter)
- Gatilho: Ao mover card da Etapa 3 para 4.
- Interface: Checklist de Ambientes cadastrados.
- Ação: "Criar Lote de Produção".
- Lógica: Ambientes selecionados avançam para Etapa 4. Os não selecionados permanecem na Etapa 3.

### 3. Cadastro de Ambientes (Detalhes)
- No formulário de Venda/Projeto, permitir adicionar múltiplos ambientes com:
  - Nome, Metragem (m²), Nível de Urgência e Observações.

### 4. Mobile App (Vistoria)
- Rota específica para celular.
- Bloqueio: O botão "Concluir Ambiente" só habilita após upload de foto (input type file/camera).