export enum ViewState {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  KANBAN = 'KANBAN',
  CLIENT_LIST = 'CLIENT_LIST',
  CLIENT_REGISTRATION = 'CLIENT_REGISTRATION',
  PROJECT_DETAILS = 'PROJECT_DETAILS',
  ASSISTANCE = 'ASSISTANCE',
  SETTINGS = 'SETTINGS',
}

export type Role = 'Admin' | 'Proprietario' | 'Gerente' | 'Vendedor' | 'Projetista' | 'Medidor' | 'Coordenador de Montagem' | 'Montador' | 'Logistica' | 'Liberador' | 'Financeiro' | 'Industria';

export interface User {
  id: string;
  name: string;
  email?: string; // Optional if not system user
  password?: string; // Optional if not system user
  role: Role;
  avatar?: string;
  phone?: string;
  
  // Employee Details
  isSystemUser: boolean;
  cpf?: string;
  rg?: string;
  address?: string;
  contractType?: 'CLT' | 'PJ';
}

export interface CompanySettings {
  name: string;
  logoUrl?: string;
  cnpj: string;
  corporateName: string; // Razão Social
  address: string;
  phone: string;
  socialMedia?: string; // Instagram/Facebook link
  primaryColor?: string;
}

export interface PermissionConfig {
  role: Role;
  canViewDashboard: boolean;
  canViewKanban: boolean;
  canViewClients: boolean;
  canViewSettings: boolean;
  canEditProject: boolean;
  canAdvanceStep: boolean;
}

export interface WorkflowStep {
  id: string;
  label: string;
  ownerRole: Role;
  sla: number; // in days
  stage: number; // 1 to 10
}

export interface Note {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  type: 'MANUAL' | 'SYSTEM';
}

export interface FactoryOrder {
  id: string;
  environmentId: string;
  environmentName: string;
  partDescription: string;
  status: 'Solicitado' | 'Em Produção' | 'Entregue';
  createdAt: string;
}

export interface Environment {
  id: string;
  name: string;
  area_sqm?: number;
  urgency_level?: 'Baixa' | 'Média' | 'Alta';
  estimated_value?: number;
  observations: string;
  status: 'Pending' | 'InBatch' | 'PostAssembly' | 'Completed';
  version?: number; // Added version control
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: 'Ativo' | 'Perdido' | 'Concluido';
  avatar?: string; // Deprecated in UI but kept for compatibility logic if needed
  
  origin?: string; 
  consultant_name?: string;
  commissioned_specifier?: string;
  briefing_date?: string;

  profile_residents?: string;
  profile_routine?: string;
  profile_pains?: string;

  property_type?: 'Reforma' | 'Construção Nova' | '';
  property_location?: string;
  property_area?: number;
  architect_name?: string;
  architect_contact?: string;

  time_move_in?: string;
  time_measurement_ready?: string;
  time_decision_expectation?: string;

  project_style?: string;
  project_has_architect_project?: 'Sim' | 'Não' | 'Cliente Irá Fornecer';
  project_materials?: string;
  project_special_reqs?: string;

  budget_expectation?: number;
  payment_preference?: 'À vista' | 'Parcelado' | '';
  payment_conditions?: string;
  negotiation_notes?: string;
  competitors_search?: string;
}

export interface Project {
  id: string;
  client: Client;
  sellerId?: string;
  sellerName?: string;
  created_at: string;
  environments: Environment[];
  notes: Note[];
  factoryOrders: FactoryOrder[];
  total_estimated_value?: number;
}

export interface Batch {
  id: string;
  projectId: string;
  name: string;
  currentStepId: string;
  environmentIds: string[];
  createdAt: string;
  lastUpdated: string;
}

// Assistance Types
export type AssistanceStatus = 
  | 'VISITA' 
  | '10.1' // Solicitação de Peças
  | '10.2' // Fabricação
  | '10.3' // Transporte
  | '10.4' // Montagem Assistência
  | '10.6' // Checklist Finalização
  | 'CONCLUIDO';

export interface AssistanceItem {
  id: string;
  environmentName: string;
  problemDescription: string;
  measurements?: string; // Medidas
  photos?: string[]; // URLs
  partNeeded?: string;
  
  // New Fields
  costType?: 'Custo Fábrica' | 'Custo Loja';
  itemType?: 'Compra' | 'Fabricação';
  supplier?: string;
  supplierDeadline?: string;
}

export interface AssistanceTicket {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  status: AssistanceStatus;
  priority: 'Normal' | 'Urgente';
  createdAt: string;
  updatedAt: string;
  items: AssistanceItem[];
  notes?: string;
  assemblerName?: string; // Montador Responsável
}

export interface AssistanceWorkflowStep {
  id: AssistanceStatus;
  label: string;
  sla: number; // days
}

// UI Types
export interface KanbanCard {
  id: string;
  title: string;
  subtitle: string;
  clientName: string;
  // clientAvatar?: string; REMOVED VISUALLY
  stepLabel: string;
  owner: string;
  sellerName?: string;
  slaStatus: 'No Prazo' | 'Atenção' | 'Atrasado';
  slaColor: 'emerald' | 'orange' | 'rose';
  daysDiff: number; // +5 (ahead) or -2 (late)
  date: string;
  environmentCount: number;
  currentStepId: string;
  projectId: string;
}

export interface KanbanColumn {
  id: number;
  title: string;
  cards: KanbanCard[];
}