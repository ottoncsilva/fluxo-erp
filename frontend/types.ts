export enum ViewState {
    KANBAN = 'KANBAN',
    CLIENT_LIST = 'CLIENT_LIST',
    CLIENT_REGISTRATION = 'CLIENT_REGISTRATION',
    PROJECT_DETAILS = 'PROJECT_DETAILS',
    MOBILE_INSPECTION = 'MOBILE_INSPECTION',
    SETTINGS = 'SETTINGS',
}

export type Role = 'Vendedor' | 'Projetista' | 'Medidor' | 'Liberador' | 'Financeiro' | 'Gerente' | 'Montador';

export interface TeamMember {
    id: string;
    name: string;
    role: Role;
    avatar?: string;
    email: string;
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
    area_sqm: number;
    urgency_level: 'Baixa' | 'Média' | 'Alta';
    observations: string;
    status: 'Pending' | 'InBatch' | 'PostAssembly' | 'Completed';
}

export interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    status: 'Ativo' | 'Perdido' | 'Concluido';
    origin?: string;
    architect_contact?: string;
    pain_points?: string;
    budget_expectation?: number;
    move_in_date?: string;
    avatar?: string;
}

export interface Project {
    id: string;
    client: Client;
    created_at: string;
    environments: Environment[];
    notes: Note[];
    factoryOrders: FactoryOrder[];
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

// UI Types
export interface KanbanCard {
    id: string;
    title: string;
    subtitle: string;
    clientName: string;
    clientAvatar?: string;
    stepLabel: string;
    owner: string;
    slaStatus: 'No Prazo' | 'Atenção' | 'Atrasado' | 'Atrasado' | 'No Prazo';
    slaColor: 'emerald' | 'orange' | 'rose';
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
