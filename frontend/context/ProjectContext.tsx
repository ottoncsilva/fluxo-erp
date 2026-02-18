import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Batch, WorkflowStep, Environment, Client, TeamMember, Note, FactoryOrder } from '../types';
import * as api from '../services/api';

// Default Workflow Config
const INITIAL_WORKFLOW: Record<string, WorkflowStep> = {
    '1.1': { id: '1.1', label: 'Briefing e Qualificação', ownerRole: 'Vendedor', sla: 1, stage: 1 },
    '1.2': { id: '1.2', label: 'Visita Showroom', ownerRole: 'Vendedor', sla: 1, stage: 1 },
    '1.3': { id: '1.3', label: 'Follow Up', ownerRole: 'Vendedor', sla: 5, stage: 1 },
    '2.1': { id: '2.1', label: 'Projetar Ambientes', ownerRole: 'Projetista', sla: 1, stage: 2 },
    '2.2': { id: '2.2', label: 'Projetar Mobiliário', ownerRole: 'Projetista', sla: 4, stage: 2 },
    '2.3': { id: '2.3', label: 'Orçamento', ownerRole: 'Projetista', sla: 0, stage: 2 },
    '2.5': { id: '2.5', label: 'Apresentação', ownerRole: 'Vendedor', sla: 0, stage: 2 },
    '2.6': { id: '2.6', label: 'Ajuste de Proposta', ownerRole: 'Projetista', sla: 3, stage: 2 },
    '2.10': { id: '2.10', label: 'Aprovação Final', ownerRole: 'Vendedor', sla: 2, stage: 2 },
    '3.1': { id: '3.1', label: 'Agendamento', ownerRole: 'Medidor', sla: 0, stage: 3 },
    '3.2': { id: '3.2', label: 'Execução in Loco', ownerRole: 'Medidor', sla: 1, stage: 3 },
    '4.1': { id: '4.1', label: 'Construção Ambientes', ownerRole: 'Liberador', sla: 1, stage: 4 },
    '4.4B': { id: '4.4B', label: 'Detalhamento Executivo', ownerRole: 'Liberador', sla: 3, stage: 4 },
    '5.1': { id: '5.1', label: 'Implantação/Pedido', ownerRole: 'Financeiro', sla: 1, stage: 5 },
    '5.2': { id: '5.2', label: 'Produção Indústria', ownerRole: 'Gerente', sla: 26, stage: 5 },
    '6.1': { id: '6.1', label: 'Verificação Pré-Montagem', ownerRole: 'Gerente', sla: 2, stage: 6 },
    '7.1': { id: '7.1', label: 'Execução Montagem', ownerRole: 'Montador', sla: 3, stage: 7 },
    '8.1': { id: '8.1', label: 'Solicitação Peças', ownerRole: 'Liberador', sla: 2, stage: 8 },
    '8.2': { id: '8.2', label: 'Fabricação Reposição', ownerRole: 'Gerente', sla: 15, stage: 8 },
    '9.0': { id: '9.0', label: 'Projeto Entregue', ownerRole: 'Gerente', sla: 0, stage: 9 },
};

const SEED_TEAM: TeamMember[] = [
    { id: 't1', name: 'Carlos Silva', role: 'Vendedor', email: 'carlos@loja.com', avatar: 'https://i.pravatar.cc/150?u=carlos' },
    { id: 't2', name: 'Ana Design', role: 'Projetista', email: 'ana@loja.com', avatar: 'https://i.pravatar.cc/150?u=ana' },
    { id: 't3', name: 'Roberto Tech', role: 'Liberador', email: 'beto@loja.com', avatar: 'https://i.pravatar.cc/150?u=beto' },
];

interface ProjectContextType {
    projects: Project[];
    batches: Batch[];
    teamMembers: TeamMember[];
    workflowConfig: Record<string, WorkflowStep>;
    currentProjectId: string | null;
    addProject: (client: Client, environments: Environment[]) => void;
    advanceBatch: (batchId: string) => void;
    splitBatch: (originalBatchId: string, selectedEnvironmentIds: string[]) => void;
    getProjectById: (id: string) => Project | undefined;
    addNote: (projectId: string, content: string, authorId: string) => void;
    updateWorkflowSla: (stepId: string, days: number) => void;
    addTeamMember: (member: TeamMember) => void;
    setCurrentProjectId: (id: string | null) => void;
    updateEnvironmentStatus: (projectId: string, envId: string, status: Environment['status']) => void;
    requestFactoryPart: (projectId: string, envId: string, description: string) => void;
    refreshData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>(SEED_TEAM);
    const [workflowConfig, setWorkflowConfig] = useState(INITIAL_WORKFLOW);
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    const refreshData = async () => {
        try {
            const data = await api.fetchProjects();
            setProjects(data.projects);
            setBatches(data.batches);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    const getProjectById = (id: string) => projects.find(p => p.id === id);

    const addProject = async (client: Client, environments: Environment[]) => {
        try {
            await api.createProject(client, environments);
            await refreshData();
        } catch (error) {
            console.error("Failed to create project", error);
        }
    };

    const advanceBatch = (batchId: string) => {
        setBatches(prev => prev.map(batch => {
            if (batch.id !== batchId) return batch;
            const steps = Object.keys(workflowConfig);
            const currentIndex = steps.indexOf(batch.currentStepId);
            const nextStepId = steps[currentIndex + 1];
            if (nextStepId) {
                // Here we would call API to update status
                return { ...batch, currentStepId: nextStepId, lastUpdated: new Date().toISOString() };
            }
            return batch;
        }));
    };

    const splitBatch = (originalBatchId: string, selectedEnvironmentIds: string[]) => {
        // Mock logic for split
        console.log("Split batch not fully implemented in backend yet");
    };

    const addNote = (projectId: string, content: string, authorId: string) => {
        // Mock note
    };

    const updateWorkflowSla = (stepId: string, days: number) => {
        setWorkflowConfig(prev => ({
            ...prev,
            [stepId]: { ...prev[stepId], sla: days }
        }));
    };

    const addTeamMember = (member: TeamMember) => {
        setTeamMembers(prev => [...prev, member]);
    };

    const updateEnvironmentStatus = (projectId: string, envId: string, status: Environment['status']) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                environments: p.environments.map(e => e.id === envId ? { ...e, status } : e)
            };
        }));
    };

    const requestFactoryPart = (projectId: string, envId: string, description: string) => {
        // Mock logic
    };

    return (
        <ProjectContext.Provider value={{
            projects, batches, teamMembers, workflowConfig, currentProjectId,
            addProject, advanceBatch, splitBatch, getProjectById, addNote, updateWorkflowSla, addTeamMember, setCurrentProjectId, updateEnvironmentStatus, requestFactoryPart, refreshData
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
