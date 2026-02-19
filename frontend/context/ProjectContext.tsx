import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { Project, Batch, WorkflowStep, Environment, Client, User, Role, Note, FactoryOrder, PermissionConfig, AssistanceTicket, CompanySettings, AssistanceWorkflowStep, AssistanceStatus } from '../types';
import api from '../services/api';

// ─── WORKFLOW CONFIG ─────────────────────────────────────────────────────────
const INITIAL_WORKFLOW: Record<string, WorkflowStep> = {
    '1.1': { id: '1.1', label: 'Briefing e Qualificação', ownerRole: 'Vendedor', sla: 1, stage: 1 },
    '1.2': { id: '1.2', label: 'Visita Showroom', ownerRole: 'Vendedor', sla: 5, stage: 1 },
    '1.3': { id: '1.3', label: 'Follow Up (Pré-Venda)', ownerRole: 'Vendedor', sla: 10, stage: 1 },
    '2.1': { id: '2.1', label: 'Projetar Ambientes', ownerRole: 'Projetista', sla: 1, stage: 2 },
    '2.2': { id: '2.2', label: 'Projetar Mobiliário', ownerRole: 'Projetista', sla: 4, stage: 2 },
    '2.3': { id: '2.3', label: 'Orçamento', ownerRole: 'Projetista', sla: 0, stage: 2 },
    '2.4': { id: '2.4', label: 'Renderização e Apresentação', ownerRole: 'Projetista', sla: 1, stage: 2 },
    '2.5': { id: '2.5', label: 'Reunião Primeira Apresentação', ownerRole: 'Vendedor', sla: 0, stage: 2 },
    '2.6': { id: '2.6', label: 'Ajuste de Proposta', ownerRole: 'Projetista', sla: 3, stage: 2 },
    '2.7': { id: '2.7', label: 'Follow Up (Venda)', ownerRole: 'Vendedor', sla: 3, stage: 2 },
    '2.8': { id: '2.8', label: 'Reunião de Fechamento', ownerRole: 'Vendedor', sla: 0, stage: 2 },
    '2.9': { id: '2.9', label: 'Detalhamento de Contrato', ownerRole: 'Vendedor', sla: 1, stage: 2 },
    '2.10': { id: '2.10', label: 'Aprovação Detalhamento Contrato', ownerRole: 'Vendedor', sla: 2, stage: 2 },
    '3.1': { id: '3.1', label: 'Avaliação para Medição', ownerRole: 'Medidor', sla: 0, stage: 3 },
    '3.2': { id: '3.2', label: 'Medição', ownerRole: 'Medidor', sla: 1, stage: 3 },
    '4.1': { id: '4.1', label: 'Construção dos Ambientes', ownerRole: 'Liberador', sla: 1, stage: 4 },
    '4.2': { id: '4.2', label: 'Reunião Alinhamento c/ Vendas', ownerRole: 'Liberador', sla: 1, stage: 4 },
    '4.3': { id: '4.3', label: 'Construção do Mobiliário', ownerRole: 'Liberador', sla: 4, stage: 4 },
    '4.4': { id: '4.4', label: 'Aprovação Financeira', ownerRole: 'Financeiro', sla: 2, stage: 4 },
    '4.5': { id: '4.5', label: 'Detalhamento Executivo', ownerRole: 'Liberador', sla: 3, stage: 4 },
    '4.6': { id: '4.6', label: 'Aprovação do Executivo', ownerRole: 'Vendedor', sla: 2, stage: 4 },
    '4.7': { id: '4.7', label: 'Correção', ownerRole: 'Liberador', sla: 1, stage: 4 },
    '4.8': { id: '4.8', label: 'Aprov. Financeira (Executivo)', ownerRole: 'Financeiro', sla: 1, stage: 4 },
    '4.9': { id: '4.9', label: 'Aprov. Executivo (Final)', ownerRole: 'Liberador', sla: 0, stage: 4 },
    '5.1': { id: '5.1', label: 'Implantação', ownerRole: 'Financeiro', sla: 1, stage: 5 },
    '5.2': { id: '5.2', label: 'Fabricação', ownerRole: 'Industria', sla: 26, stage: 5 },
    '6.1': { id: '6.1', label: 'Verificação pré-montagem', ownerRole: 'Coordenador de Montagem', sla: 2, stage: 6 },
    '6.2': { id: '6.2', label: 'Agendar Transporte', ownerRole: 'Coordenador de Montagem', sla: 0, stage: 6 },
    '6.3': { id: '6.3', label: 'Transporte e Entrega', ownerRole: 'Logistica', sla: 5, stage: 6 },
    '7.1': { id: '7.1', label: 'Montagem', ownerRole: 'Montador', sla: 3, stage: 7 },
    '7.2': { id: '7.2', label: 'Checklist Finalização Montagem', ownerRole: 'Coordenador de Montagem', sla: 1, stage: 7 },
    '8.1': { id: '8.1', label: 'Solicitação de Peças', ownerRole: 'Liberador', sla: 2, stage: 8 },
    '8.2': { id: '8.2', label: 'Fabricação (Reposição)', ownerRole: 'Industria', sla: 15, stage: 8 },
    '8.3': { id: '8.3', label: 'Transporte e Entrega (Reposição)', ownerRole: 'Logistica', sla: 5, stage: 8 },
    '8.4': { id: '8.4', label: 'Pós Montagem', ownerRole: 'Montador', sla: 7, stage: 8 },
    '8.5': { id: '8.5', label: 'Checklist Finalização Pós', ownerRole: 'Montador', sla: 1, stage: 8 },
    '9.0': { id: '9.0', label: 'Projeto Entregue', ownerRole: 'Gerente', sla: 0, stage: 9 },
};

const INITIAL_ASSISTANCE_WORKFLOW: AssistanceWorkflowStep[] = [
    { id: 'VISITA', label: 'Visita de Levantamento', sla: 3 },
    { id: '10.1', label: 'Solicitação de Peças', sla: 2 },
    { id: '10.2', label: 'Fabricação', sla: 15 },
    { id: '10.3', label: 'Transporte e Entrega', sla: 5 },
    { id: '10.4', label: 'Montagem Assistência', sla: 4 },
    { id: '10.6', label: 'Checklist Finalização Assistência', sla: 1 },
    { id: 'CONCLUIDO', label: 'Concluído', sla: 0 },
];

const DEFAULT_PERMISSIONS: PermissionConfig[] = [
    { role: 'Admin', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: true, canEditProject: true, canAdvanceStep: true },
    { role: 'Vendedor', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: false, canEditProject: true, canAdvanceStep: true },
    { role: 'Projetista', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: false, canEditProject: true, canAdvanceStep: true },
    { role: 'Gerente', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: true, canEditProject: true, canAdvanceStep: true },
    { role: 'Coordenador de Montagem', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: false, canEditProject: true, canAdvanceStep: true },
    { role: 'Montador', canViewDashboard: true, canViewKanban: false, canViewClients: false, canViewSettings: false, canEditProject: false, canAdvanceStep: false },
    { role: 'Logistica', canViewDashboard: true, canViewKanban: true, canViewClients: false, canViewSettings: false, canEditProject: false, canAdvanceStep: true },
    { role: 'Medidor', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: false, canEditProject: false, canAdvanceStep: true },
    { role: 'Proprietario', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: true, canEditProject: true, canAdvanceStep: true },
    { role: 'Liberador', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: false, canEditProject: true, canAdvanceStep: true },
    { role: 'Financeiro', canViewDashboard: true, canViewKanban: true, canViewClients: true, canViewSettings: false, canEditProject: false, canAdvanceStep: true },
    { role: 'Industria', canViewDashboard: true, canViewKanban: true, canViewClients: false, canViewSettings: false, canEditProject: false, canAdvanceStep: true },
];

const DEFAULT_ORIGINS = ['Captação (Vendedor)', 'Porta de Loja', 'Indicação Cliente', 'Indicação Especif.', 'Recompra', 'Redes Sociais', 'Google Ads'];

const DEFAULT_COMPANY: CompanySettings = {
    name: 'FluxoPlanejados',
    cnpj: '',
    corporateName: '',
    address: '',
    phone: '',
    socialMedia: '',
};

// ─── CONTEXT TYPE ────────────────────────────────────────────────────────────
interface ProjectContextType {
    currentUser: User | null;
    users: User[];
    projects: Project[];
    batches: Batch[];
    workflowConfig: Record<string, WorkflowStep>;
    permissions: PermissionConfig[];
    currentProjectId: string | null;
    origins: string[];
    assistanceTickets: AssistanceTicket[];
    companySettings: CompanySettings;
    assistanceWorkflow: AssistanceWorkflowStep[];
    isLoading: boolean;

    login: (email: string, pass: string) => Promise<boolean>;
    logout: () => void;
    addUser: (user: User) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (userId: string) => Promise<void>;
    updatePermissions: (newPermissions: PermissionConfig[]) => void;
    updateOrigins: (newOrigins: string[]) => void;
    updateCompanySettings: (settings: CompanySettings) => Promise<void>;
    updateAssistanceSla: (stepId: AssistanceStatus, days: number) => void;

    addProject: (client: Client, environments: Environment[]) => Promise<void>;
    advanceBatch: (batchId: string) => Promise<void>;
    isLastStep: (stepId: string) => boolean;
    splitBatch: (originalBatchId: string, selectedEnvironmentIds: string[]) => Promise<void>;
    getProjectById: (id: string) => Project | undefined;
    addNote: (projectId: string, content: string, authorId: string) => Promise<void>;
    updateWorkflowSla: (stepId: string, days: number) => void;
    setCurrentProjectId: (id: string | null) => void;
    updateEnvironmentStatus: (projectId: string, envId: string, status: Environment['status']) => Promise<void>;
    updateEnvironmentDetails: (projectId: string, envId: string, updates: Partial<Environment>) => Promise<void>;
    updateClientData: (projectId: string, updates: Partial<Client>) => Promise<void>;
    updateProjectITPP: (projectId: string, updates: Partial<Client>) => Promise<void>;
    requestFactoryPart: (projectId: string, envId: string, description: string) => Promise<void>;
    refreshData: () => Promise<void>;

    addAssistanceTicket: (ticket: Omit<AssistanceTicket, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateAssistanceTicket: (ticket: AssistanceTicket) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const WORKFLOW_ORDER = [
    '1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10',
    '3.1', '3.2', '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9',
    '5.1', '5.2', '6.1', '6.2', '6.3', '7.1', '7.2', '8.1', '8.2', '8.3', '8.4', '8.5', '9.0'
];

// ─── PROVIDER ────────────────────────────────────────────────────────────────
export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        try {
            const saved = localStorage.getItem('fluxo_erp_user');
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });

    const [projects, setProjects] = useState<Project[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [assistanceTickets, setAssistanceTickets] = useState<AssistanceTicket[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanySettings>(DEFAULT_COMPANY);
    const [permissions, setPermissions] = useState<PermissionConfig[]>(DEFAULT_PERMISSIONS);
    const [workflowConfig, setWorkflowConfig] = useState(INITIAL_WORKFLOW);
    const [assistanceWorkflow, setAssistanceWorkflow] = useState<AssistanceWorkflowStep[]>(INITIAL_ASSISTANCE_WORKFLOW);
    const [origins, setOrigins] = useState<string[]>(DEFAULT_ORIGINS);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // ── Load data from API ──
    const refreshData = useCallback(async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            const [projRes, usersRes, companyRes, assistRes] = await Promise.allSettled([
                api.get('/projects'),
                api.get('/users'),
                api.get('/settings/company'),
                api.get('/assistance'),
            ]);
            if (projRes.status === 'fulfilled') {
                setProjects(projRes.value.data.projects || []);
                setBatches(projRes.value.data.batches || []);
            }
            if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data || []);
            if (companyRes.status === 'fulfilled') setCompanySettings(companyRes.value.data || DEFAULT_COMPANY);
            if (assistRes.status === 'fulfilled') setAssistanceTickets(assistRes.value.data || []);
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) refreshData();
    }, [currentUser, refreshData]);

    // ── AUTH ──
    const login = async (email: string, pass: string): Promise<boolean> => {
        try {
            const res = await api.post('/auth/login', { email, password: pass });
            const { access_token, user } = res.data;
            localStorage.setItem('fluxo_erp_token', access_token);
            localStorage.setItem('fluxo_erp_user', JSON.stringify(user));
            setCurrentUser(user);
            return true;
        } catch {
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('fluxo_erp_token');
        localStorage.removeItem('fluxo_erp_user');
        setCurrentUser(null);
        setProjects([]);
        setBatches([]);
    };

    // ── PROJECTS ──
    const addProject = async (client: Client, environments: Environment[]) => {
        await api.post('/projects/full', {
            client,
            environments,
            seller_name: currentUser?.name,
        });
        await refreshData();
    };

    const addNote = async (projectId: string, content: string, authorId: string) => {
        await api.post(`/projects/${projectId}/notes`, {
            content,
            author_id: authorId === 'sys' ? 'sys' : authorId,
            author_name: authorId === 'sys' ? 'Sistema' : currentUser?.name || 'Usuário',
            note_type: authorId === 'sys' ? 'SYSTEM' : 'MANUAL',
        });
        await refreshData();
    };

    const updateClientData = async (projectId: string, updates: Partial<Client>) => {
        await api.patch(`/projects/${projectId}/client`, updates);
        await refreshData();
    };

    const updateProjectITPP = async (projectId: string, updates: Partial<Client>) => {
        await api.patch(`/projects/${projectId}/client`, updates);
        await refreshData();
    };

    const updateEnvironmentStatus = async (projectId: string, envId: string, status: Environment['status']) => {
        await api.patch(`/projects/${projectId}/environments/${envId}`, { status });
        setProjects(prev => prev.map(p => p.id !== projectId ? p : {
            ...p,
            environments: p.environments.map(e => e.id === envId ? { ...e, status } : e)
        }));
    };

    const updateEnvironmentDetails = async (projectId: string, envId: string, updates: Partial<Environment>) => {
        await api.patch(`/projects/${projectId}/environments/${envId}`, updates);
        setProjects(prev => prev.map(p => p.id !== projectId ? p : {
            ...p,
            environments: p.environments.map(e => e.id === envId ? { ...e, ...updates } : e)
        }));
    };

    const requestFactoryPart = async (projectId: string, envId: string, description: string) => {
        const project = projects.find(p => p.id === projectId);
        const env = project?.environments.find(e => e.id === envId);
        await api.post(`/projects/${projectId}/factory-order`, {
            environment_id: envId,
            environment_name: env?.name || 'Ambiente',
            part_description: description,
        });
        await refreshData();
    };

    // ── BATCHES ──
    const advanceBatch = async (batchId: string) => {
        await api.post(`/batches/${batchId}/advance`);
        await refreshData();
    };

    const isLastStep = (stepId: string) => stepId === WORKFLOW_ORDER[WORKFLOW_ORDER.length - 1];

    const splitBatch = async (originalBatchId: string, selectedEnvironmentIds: string[]) => {
        await api.post(`/batches/${originalBatchId}/split`, selectedEnvironmentIds);
        await refreshData();
    };

    const getProjectById = (id: string) => projects.find(p => p.id === id);

    // ── USERS ──
    const addUser = async (user: User) => {
        await api.post('/users', {
            email: user.email,
            password: user.password || '123456',
            full_name: user.name,
            role: user.role,
            avatar: user.avatar,
            contract_type: user.contractType,
        });
        await refreshData();
    };

    const updateUser = async (updatedUser: User) => {
        await api.patch(`/users/${updatedUser.id}`, {
            email: updatedUser.email,
            password: updatedUser.password || undefined,
            full_name: updatedUser.name,
            role: updatedUser.role,
            avatar: updatedUser.avatar,
            contract_type: updatedUser.contractType,
        });
        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(updatedUser);
            localStorage.setItem('fluxo_erp_user', JSON.stringify(updatedUser));
        }
        await refreshData();
    };

    const deleteUser = async (userId: string) => {
        await api.delete(`/users/${userId}`);
        setUsers(prev => prev.filter(u => u.id !== userId));
    };

    // ── SETTINGS ──
    const updatePermissions = (newPerms: PermissionConfig[]) => setPermissions(newPerms);
    const updateOrigins = (newOrigins: string[]) => setOrigins(newOrigins);

    const updateCompanySettings = async (settings: CompanySettings) => {
        await api.put('/settings/company', {
            name: settings.name,
            cnpj: settings.cnpj,
            corporate_name: settings.corporateName,
            address: settings.address,
            phone: settings.phone,
            social_media: settings.socialMedia,
            logo_url: settings.logoUrl,
        });
        setCompanySettings(settings);
    };

    const updateAssistanceSla = (stepId: AssistanceStatus, days: number) => {
        setAssistanceWorkflow(prev => prev.map(s => s.id === stepId ? { ...s, sla: days } : s));
    };

    const updateWorkflowSla = (stepId: string, days: number) => {
        setWorkflowConfig(prev => ({ ...prev, [stepId]: { ...prev[stepId], sla: days } }));
    };

    // ── ASSISTANCE ──
    const addAssistanceTicket = async (ticketData: Omit<AssistanceTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
        await api.post('/assistance', {
            client_name: ticketData.clientName,
            client_phone: (ticketData as any).clientPhone || null,
            project_id: (ticketData as any).projectId ? parseInt((ticketData as any).projectId) : null,
            description: ticketData.notes || ticketData.title || '',
            status: ticketData.status,
            current_step: ticketData.status,
        });
        await refreshData();
    };

    const updateAssistanceTicket = async (ticket: AssistanceTicket) => {
        await api.patch(`/assistance/${ticket.id}`, {
            status: ticket.status,
            current_step: ticket.status,
            description: ticket.notes || ticket.title || '',
        });
        await refreshData();
    };

    return (
        <ProjectContext.Provider value={{
            currentUser, users, projects, batches, workflowConfig, permissions, currentProjectId,
            origins, assistanceTickets, companySettings, assistanceWorkflow, isLoading,
            login, logout, addUser, updateUser, deleteUser, updatePermissions, updateOrigins,
            updateCompanySettings, updateAssistanceSla,
            addProject, advanceBatch, isLastStep, splitBatch, getProjectById, addNote,
            updateWorkflowSla, setCurrentProjectId, updateEnvironmentStatus, requestFactoryPart,
            updateEnvironmentDetails, updateClientData, updateProjectITPP, refreshData,
            addAssistanceTicket, updateAssistanceTicket,
        }}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjects = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error('useProjects must be used within a ProjectProvider');
    return context;
};