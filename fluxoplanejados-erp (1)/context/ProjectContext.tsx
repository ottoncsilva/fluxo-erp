import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project, Batch, WorkflowStep, Environment, Client, User, Role, Note, FactoryOrder, PermissionConfig, AssistanceTicket, CompanySettings, AssistanceWorkflowStep, AssistanceStatus } from '../types';

// Updated Workflow Config based on PDF
const INITIAL_WORKFLOW: Record<string, WorkflowStep> = {
  // 1 - Pré-Venda
  '1.1': { id: '1.1', label: 'Briefing e Qualificação', ownerRole: 'Vendedor', sla: 1, stage: 1 },
  '1.2': { id: '1.2', label: 'Visita Showroom', ownerRole: 'Vendedor', sla: 5, stage: 1 },
  '1.3': { id: '1.3', label: 'Follow Up (Pré-Venda)', ownerRole: 'Vendedor', sla: 10, stage: 1 },
  
  // 2 - Venda
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

  // 3 - Medição
  '3.1': { id: '3.1', label: 'Avaliação para Medição', ownerRole: 'Medidor', sla: 0, stage: 3 },
  '3.2': { id: '3.2', label: 'Medição', ownerRole: 'Medidor', sla: 1, stage: 3 },

  // 4 - Executivo
  '4.1': { id: '4.1', label: 'Construção dos Ambientes', ownerRole: 'Liberador', sla: 1, stage: 4 },
  '4.2': { id: '4.2', label: 'Reunião Alinhamento c/ Vendas', ownerRole: 'Liberador', sla: 1, stage: 4 },
  '4.3': { id: '4.3', label: 'Construção do Mobiliário', ownerRole: 'Liberador', sla: 4, stage: 4 },
  '4.4': { id: '4.4', label: 'Aprovação Financeira', ownerRole: 'Financeiro', sla: 2, stage: 4 },
  '4.5': { id: '4.5', label: 'Detalhamento Executivo', ownerRole: 'Liberador', sla: 3, stage: 4 },
  '4.6': { id: '4.6', label: 'Aprovação do Executivo', ownerRole: 'Vendedor', sla: 2, stage: 4 },
  '4.7': { id: '4.7', label: 'Correção', ownerRole: 'Liberador', sla: 1, stage: 4 },
  '4.8': { id: '4.8', label: 'Aprov. Financeira (Executivo)', ownerRole: 'Financeiro', sla: 1, stage: 4 },
  '4.9': { id: '4.9', label: 'Aprov. Executivo (Final)', ownerRole: 'Liberador', sla: 0, stage: 4 },

  // 5 - Fabricação
  '5.1': { id: '5.1', label: 'Implantação', ownerRole: 'Financeiro', sla: 1, stage: 5 },
  '5.2': { id: '5.2', label: 'Fabricação', ownerRole: 'Industria', sla: 26, stage: 5 },

  // 6 - Entrega
  '6.1': { id: '6.1', label: 'Verificação pré-montagem', ownerRole: 'Coordenador de Montagem', sla: 2, stage: 6 },
  '6.2': { id: '6.2', label: 'Agendar Transporte', ownerRole: 'Coordenador de Montagem', sla: 0, stage: 6 },
  '6.3': { id: '6.3', label: 'Transporte e Entrega', ownerRole: 'Logistica', sla: 5, stage: 6 },

  // 7 - Montagem
  '7.1': { id: '7.1', label: 'Montagem', ownerRole: 'Montador', sla: 3, stage: 7 },
  '7.2': { id: '7.2', label: 'Checklist Finalização Montagem', ownerRole: 'Coordenador de Montagem', sla: 1, stage: 7 },

  // 8 - Pós Montagem
  '8.1': { id: '8.1', label: 'Solicitação de Peças', ownerRole: 'Liberador', sla: 2, stage: 8 },
  '8.2': { id: '8.2', label: 'Fabricação (Reposição)', ownerRole: 'Industria', sla: 15, stage: 8 },
  '8.3': { id: '8.3', label: 'Transporte e Entrega (Reposição)', ownerRole: 'Logistica', sla: 5, stage: 8 },
  '8.4': { id: '8.4', label: 'Pós Montagem', ownerRole: 'Montador', sla: 7, stage: 8 },
  '8.5': { id: '8.5', label: 'Checklist Finalização Pós', ownerRole: 'Montador', sla: 1, stage: 8 },

  // 9 - Conclusão
  '9.0': { id: '9.0', label: 'Projeto Entregue', ownerRole: 'Gerente', sla: 0, stage: 9 },
};

// Explicit Order matching PDF Pages 1-8
const WORKFLOW_ORDER = [
    '1.1', '1.2', '1.3',
    '2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7', '2.8', '2.9', '2.10',
    '3.1', '3.2',
    '4.1', '4.2', '4.3', '4.4', '4.5', '4.6', '4.7', '4.8', '4.9',
    '5.1', '5.2',
    '6.1', '6.2', '6.3',
    '7.1', '7.2',
    '8.1', '8.2', '8.3', '8.4', '8.5',
    '9.0'
];

const INITIAL_ASSISTANCE_WORKFLOW: AssistanceWorkflowStep[] = [
    { id: 'VISITA', label: 'Visita de Levantamento', sla: 3 },
    { id: '10.1', label: 'Solicitação de Peças', sla: 2 },
    { id: '10.2', label: 'Fabricação', sla: 15 },
    { id: '10.3', label: 'Transporte e Entrega', sla: 5 },
    { id: '10.4', label: 'Montagem Assistência', sla: 4 },
    { id: '10.6', label: 'Checklist Finalização Assistência', sla: 1 },
    { id: 'CONCLUIDO', label: 'Concluído', sla: 0 },
];

const DEFAULT_COMPANY: CompanySettings = {
    name: 'FluxoPlanejados',
    cnpj: '00.000.000/0001-00',
    corporateName: 'Fluxo Planejados Ltda',
    address: 'Av. Moveleira, 1000 - Polo Industrial',
    phone: '(11) 99999-9999',
    socialMedia: '@fluxoplanejados'
};

const SEED_USERS: User[] = [
    { id: 'u1', name: 'Otton Silva', email: 'ottonsilva@gmail.com', password: '123456', role: 'Admin', avatar: 'https://i.pravatar.cc/150?u=otton', isSystemUser: true, contractType: 'PJ' },
    { id: 'u2', name: 'Carlos Vendedor', email: 'carlos@loja.com', password: '123', role: 'Vendedor', avatar: 'https://i.pravatar.cc/150?u=carlos', isSystemUser: true, contractType: 'CLT' },
];

const SEED_CLIENTS: Client[] = [
  { 
      id: 'c1', 
      name: 'Ana Silva', 
      phone: '11999999999', 
      email: 'ana@email.com', 
      address: 'Rua A, 123', 
      status: 'Ativo', 
      origin: 'Instagram', 
      budget_expectation: 150000, 
      time_move_in: '2024-12-20', 
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAs9yRyInga9wXphfqLplIE6M9zV3D2SR0EJGSoiwrxDe7MWvKwCX4RbB0MC06JhvFlI7_kGy8Ef6Fbee5M0m6c6xQzabEroIkRFkCnyE2oFS45tm__KYDgiHgkJDFzFGcmatZ5H7EAumoilhglEDposoDg-C4njbLh93HilWbS9CJntnPXYx5GX4Je3IYfvFlCKtFGWOzyBYwHkGTfLE6-uL6HsH1OMqKcgG6178PExcElFGeQowNZ4lMGJXMYQgDhzPTgvUruEjc',
      profile_pains: 'Precisa de muito espaço de armazenamento.',
      property_type: 'Reforma'
  },
  { 
      id: 'c2', 
      name: 'João Souza', 
      phone: '11988888888', 
      email: 'joao@email.com', 
      address: 'Av Paulista, 100', 
      status: 'Ativo', 
      origin: 'Indicação Arquiteto', 
      budget_expectation: 300000,
      property_type: 'Construção Nova'
  },
];

const SEED_PROJECTS: Project[] = [
  {
    id: 'p1', client: SEED_CLIENTS[0], sellerName: 'Otton Silva', created_at: '2024-10-10',
    environments: [{ id: 'e1', name: 'Sala de Estar', area_sqm: 25, urgency_level: 'Média', estimated_value: 45000, observations: '', status: 'InBatch', version: 1 }, { id: 'e2', name: 'Cozinha', area_sqm: 12, urgency_level: 'Alta', estimated_value: 32000, observations: '', status: 'InBatch', version: 1 }],
    notes: [{ id: 'n1', content: 'Projeto criado no sistema.', authorId: 'sys', authorName: 'Sistema', createdAt: '2024-10-10T10:00:00', type: 'SYSTEM' }],
    factoryOrders: []
  },
  {
    id: 'p2', client: SEED_CLIENTS[1], sellerName: 'Carlos Vendedor', created_at: '2024-09-15',
    environments: [{ id: 'e3', name: 'Suíte Master', area_sqm: 30, urgency_level: 'Alta', estimated_value: 55000, observations: '', status: 'InBatch', version: 1 }],
    notes: [{ id: 'n2', content: 'Cliente solicitou mudança no acabamento da suíte.', authorId: 't1', authorName: 'Carlos Silva', createdAt: '2024-10-15T14:30:00', type: 'MANUAL' }],
    factoryOrders: []
  }
];

const SEED_BATCHES: Batch[] = [
  { id: 'b1', projectId: 'p1', name: 'Projeto Completo', currentStepId: '1.2', environmentIds: ['e1', 'e2'], createdAt: '2024-10-10', lastUpdated: '2024-10-12' },
  { id: 'b2', projectId: 'p2', name: 'Lote 1', currentStepId: '4.5', environmentIds: ['e3'], createdAt: '2024-09-15', lastUpdated: '2024-10-18' },
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
  
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  updatePermissions: (newPermissions: PermissionConfig[]) => void;
  updateOrigins: (newOrigins: string[]) => void;
  updateCompanySettings: (settings: CompanySettings) => void;
  updateAssistanceSla: (stepId: AssistanceStatus, days: number) => void;

  addProject: (client: Client, environments: Environment[]) => void;
  advanceBatch: (batchId: string) => void;
  isLastStep: (stepId: string) => boolean;
  splitBatch: (originalBatchId: string, selectedEnvironmentIds: string[]) => void;
  getProjectById: (id: string) => Project | undefined;
  addNote: (projectId: string, content: string, authorId: string) => void;
  updateWorkflowSla: (stepId: string, days: number) => void;
  setCurrentProjectId: (id: string | null) => void;
  updateEnvironmentStatus: (projectId: string, envId: string, status: Environment['status']) => void;
  updateEnvironmentDetails: (projectId: string, envId: string, updates: Partial<Environment>) => void;
  updateClientData: (projectId: string, updates: Partial<Client>) => void;
  updateProjectITPP: (projectId: string, updates: Partial<Client>) => void;
  requestFactoryPart: (projectId: string, envId: string, description: string) => void;
  
  // Assistance
  addAssistanceTicket: (ticket: Omit<AssistanceTicket, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAssistanceTicket: (ticket: AssistanceTicket) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEY_USER = 'fluxo_erp_user';
const STORAGE_KEY_USERS_LIST = 'fluxo_erp_users_list';
const STORAGE_KEY_ORIGINS = 'fluxo_erp_origins';
const STORAGE_KEY_COMPANY = 'fluxo_erp_company';
const STORAGE_KEY_ASSISTANCE_SLA = 'fluxo_erp_assistance_sla';
const STORAGE_KEY_PROJECTS = 'fluxo_erp_projects';
const STORAGE_KEY_BATCHES = 'fluxo_erp_batches';

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize Users
  const [users, setUsers] = useState<User[]>(() => {
    try {
        const savedUsers = localStorage.getItem(STORAGE_KEY_USERS_LIST);
        return savedUsers ? JSON.parse(savedUsers) : SEED_USERS;
    } catch (e) { return SEED_USERS; }
  });

  // Initialize Origins
  const [origins, setOrigins] = useState<string[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_ORIGINS);
        return saved ? JSON.parse(saved) : DEFAULT_ORIGINS;
    } catch (e) { return DEFAULT_ORIGINS; }
  });

   // Initialize Company
   const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_COMPANY);
        return saved ? JSON.parse(saved) : DEFAULT_COMPANY;
    } catch (e) { return DEFAULT_COMPANY; }
  });

  // Initialize Assistance Workflow
  const [assistanceWorkflow, setAssistanceWorkflow] = useState<AssistanceWorkflowStep[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_ASSISTANCE_SLA);
        return saved ? JSON.parse(saved) : INITIAL_ASSISTANCE_WORKFLOW;
    } catch (e) { return INITIAL_ASSISTANCE_WORKFLOW; }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
      try {
          const savedUser = localStorage.getItem(STORAGE_KEY_USER);
          return savedUser ? JSON.parse(savedUser) : null;
      } catch (e) { return null; }
  });

  // Projects & Batches with Persistence
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
        return saved ? JSON.parse(saved) : SEED_PROJECTS;
    } catch (e) { return SEED_PROJECTS; }
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY_BATCHES);
        return saved ? JSON.parse(saved) : SEED_BATCHES;
    } catch (e) { return SEED_BATCHES; }
  });

  const [permissions, setPermissions] = useState<PermissionConfig[]>(DEFAULT_PERMISSIONS);
  const [workflowConfig, setWorkflowConfig] = useState(INITIAL_WORKFLOW);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [assistanceTickets, setAssistanceTickets] = useState<AssistanceTicket[]>([]);

  // Effects for Persistence
  useEffect(() => { localStorage.setItem(STORAGE_KEY_USERS_LIST, JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_ORIGINS, JSON.stringify(origins)); }, [origins]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(companySettings)); }, [companySettings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_ASSISTANCE_SLA, JSON.stringify(assistanceWorkflow)); }, [assistanceWorkflow]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(batches)); }, [batches]);

  // Auth Logic
  const login = (email: string, pass: string) => {
      const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase() && u.password === pass && u.isSystemUser);
      if (user) {
          setCurrentUser(user);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
          return true;
      }
      return false;
  };

  const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem(STORAGE_KEY_USER);
  };

  const addUser = (user: User) => setUsers(prev => [...prev, user]);
  
  const updateUser = (updatedUser: User) => {
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
      if (currentUser?.id === updatedUser.id) {
          setCurrentUser(updatedUser);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      }
  };

  const deleteUser = (userId: string) => {
      setUsers(prev => prev.filter(u => u.id !== userId));
  }

  const updatePermissions = (newPerms: PermissionConfig[]) => setPermissions(newPerms);
  const updateOrigins = (newOrigins: string[]) => setOrigins(newOrigins);
  const updateCompanySettings = (settings: CompanySettings) => setCompanySettings(settings);

  const updateAssistanceSla = (stepId: AssistanceStatus, days: number) => {
      setAssistanceWorkflow(prev => prev.map(step => step.id === stepId ? { ...step, sla: days } : step));
  };

  const getProjectById = (id: string) => projects.find(p => p.id === id);

  const addProject = (client: Client, environments: Environment[]) => {
    const newProject: Project = {
      id: `p-${Date.now()}`,
      client: { ...client, status: 'Ativo' },
      sellerName: currentUser?.name || 'Vendedor',
      created_at: new Date().toISOString(),
      environments,
      notes: [{ id: `n-${Date.now()}`, content: 'Projeto iniciado.', authorId: 'sys', authorName: 'Sistema', createdAt: new Date().toISOString(), type: 'SYSTEM' }],
      factoryOrders: []
    };
    const newBatch: Batch = {
      id: `b-${Date.now()}`,
      projectId: newProject.id,
      name: 'Projeto Completo',
      currentStepId: '1.1',
      environmentIds: environments.map(e => e.id),
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    setProjects(prev => [...prev, newProject]);
    setBatches(prev => [...prev, newBatch]);
  };

  const addNote = (projectId: string, content: string, authorId: string) => {
      const author = authorId === 'sys' ? { name: 'Sistema' } : users.find(u => u.id === authorId);
      const newNote: Note = {
          id: `n-${Date.now()}-${Math.random()}`,
          content,
          authorId,
          authorName: author ? author.name : 'Desconhecido',
          createdAt: new Date().toISOString(),
          type: authorId === 'sys' ? 'SYSTEM' : 'MANUAL'
      };
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, notes: [newNote, ...p.notes] } : p));
  };

  const isLastStep = (stepId: string) => {
      return stepId === WORKFLOW_ORDER[WORKFLOW_ORDER.length - 1];
  };

  const advanceBatch = (batchId: string) => {
    // 1. Find the batch in current state
    const batch = batches.find(b => b.id === batchId);
    if (!batch) {
        console.error("Batch not found for ID:", batchId);
        return;
    }

    // 2. Calculate next step
    let currentIndex = WORKFLOW_ORDER.indexOf(batch.currentStepId);
    
    // Auto-fix: If current step is invalid/missing, default to first step or try to find a logical match
    if (currentIndex === -1) {
        console.warn(`Step ID '${batch.currentStepId}' not found in WORKFLOW_ORDER. Attempting reset.`);
        currentIndex = 0; // Default to start if corrupted
    }
    
    if (currentIndex >= WORKFLOW_ORDER.length - 1) {
        console.warn("Already at the last step.");
        return; 
    }

    const nextStepId = WORKFLOW_ORDER[currentIndex + 1];
    const currentStepLabel = workflowConfig[batch.currentStepId]?.label || batch.currentStepId;
    const nextStepLabel = workflowConfig[nextStepId]?.label || nextStepId;

    // 3. Side Effect: Add Note (Updates Projects State)
    addNote(batch.projectId, `Etapa concluída: ${currentStepLabel} → ${nextStepLabel}`, currentUser?.id || 'sys');

    // 4. State Update: Update Batches State
    setBatches(prev => {
        const newBatches = prev.map(b => {
            if (b.id !== batchId) return b;
            return { 
                ...b, 
                currentStepId: nextStepId, 
                lastUpdated: new Date().toISOString() 
            };
        });
        // Force immediate persistence for safety
        localStorage.setItem(STORAGE_KEY_BATCHES, JSON.stringify(newBatches));
        return newBatches;
    });
  };

  const splitBatch = (originalBatchId: string, selectedEnvironmentIds: string[]) => {
    const originalBatch = batches.find(b => b.id === originalBatchId);
    if (!originalBatch) return;
    const nextStepId = '4.1'; // Logic: 3.2 (Medição) -> 4.1 (Executivo Start)
    const newBatch: Batch = {
      id: `b-${Date.now()}`,
      projectId: originalBatch.projectId,
      name: `Lote - ${new Date().toLocaleDateString()}`,
      currentStepId: nextStepId,
      environmentIds: selectedEnvironmentIds,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    const updatedOriginalBatch = {
      ...originalBatch,
      environmentIds: originalBatch.environmentIds.filter(id => !selectedEnvironmentIds.includes(id)),
      lastUpdated: new Date().toISOString()
    };
    setBatches(prev => [...prev.filter(b => b.id !== originalBatchId), newBatch, updatedOriginalBatch].filter(b => b.environmentIds.length > 0));
    addNote(originalBatch.projectId, `Lote separado criado na etapa Executivo com ${selectedEnvironmentIds.length} ambientes.`, currentUser?.id || 'sys');
  };

  const updateWorkflowSla = (stepId: string, days: number) => {
      setWorkflowConfig(prev => ({
          ...prev,
          [stepId]: { ...prev[stepId], sla: days }
      }));
  };

  // Deprecated slightly, replaced by generic updateEnvironmentDetails
  const updateEnvironmentStatus = (projectId: string, envId: string, status: Environment['status']) => {
      updateEnvironmentDetails(projectId, envId, { status });
  };

  const updateEnvironmentDetails = (projectId: string, envId: string, updates: Partial<Environment>) => {
      setProjects(prev => prev.map(p => {
          if (p.id !== projectId) return p;
          return {
              ...p,
              environments: p.environments.map(e => e.id === envId ? { ...e, ...updates } : e)
          };
      }));
  };

  const updateClientData = (projectId: string, updates: Partial<Client>) => {
      setProjects(prev => prev.map(p => {
          if (p.id !== projectId) return p;
          return {
              ...p,
              client: { ...p.client, ...updates }
          };
      }));
      addNote(projectId, 'Dados cadastrais do cliente atualizados.', currentUser?.id || 'sys');
  };

  const updateProjectITPP = (projectId: string, updates: Partial<Client>) => {
      setProjects(prev => prev.map(p => {
          if (p.id !== projectId) return p;
          return {
              ...p,
              client: { ...p.client, ...updates }
          };
      }));
      
      // Generate log for what changed
      const changedFields = Object.keys(updates).join(', ');
      addNote(projectId, `ITPP Atualizado: ${changedFields}`, currentUser?.id || 'sys');
  };

  const requestFactoryPart = (projectId: string, envId: string, description: string) => {
      const order: FactoryOrder = {
          id: `fo-${Date.now()}`,
          environmentId: envId,
          environmentName: projects.find(p => p.id === projectId)?.environments.find(e => e.id === envId)?.name || 'Ambiente',
          partDescription: description,
          status: 'Solicitado',
          createdAt: new Date().toISOString()
      };
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, factoryOrders: [...p.factoryOrders, order] } : p));
      addNote(projectId, `Peça solicitada para fábrica: ${description}`, currentUser?.id || 'sys');
  };

  // Assistance
  const addAssistanceTicket = (ticketData: Omit<AssistanceTicket, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newTicket: AssistanceTicket = {
          id: `t-${Date.now()}`,
          ...ticketData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
      };
      setAssistanceTickets(prev => [...prev, newTicket]);
  };

  const updateAssistanceTicket = (ticket: AssistanceTicket) => {
      setAssistanceTickets(prev => prev.map(t => t.id === ticket.id ? { ...ticket, updatedAt: new Date().toISOString() } : t));
  };

  return (
    <ProjectContext.Provider value={{ 
        currentUser, users, projects, batches, workflowConfig, permissions, currentProjectId, origins, assistanceTickets, companySettings, assistanceWorkflow,
        login, logout, addUser, updateUser, deleteUser, updatePermissions, updateOrigins, updateCompanySettings, updateAssistanceSla,
        addProject, advanceBatch, isLastStep, splitBatch, getProjectById, addNote, updateWorkflowSla, setCurrentProjectId, updateEnvironmentStatus, requestFactoryPart,
        updateEnvironmentDetails, updateClientData, updateProjectITPP,
        addAssistanceTicket, updateAssistanceTicket
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