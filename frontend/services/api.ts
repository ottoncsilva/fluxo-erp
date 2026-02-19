import axios from 'axios';
import { Project, Client, Batch, Environment } from '../types';

// Em produção, o Nginx faz proxy de /api/* para o backend.
// Em desenvolvimento local, chamamos o backend diretamente.
const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : '/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});


// --- Adapters (Backend -> Frontend) ---

const adaptProject = (backendData: any): Project => {
    // Backend returns: { id, name, status, client_name, client: {...}, rooms: [...] }
    // Frontend expects: Project interface from types.ts

    const client: Client = {
        id: backendData.client?.id?.toString() || 'unknown',
        name: backendData.client?.name || backendData.client_name || 'Desconhecido',
        phone: backendData.client?.phone || '',
        email: backendData.client?.email || '',
        address: backendData.client?.address || '',
        status: 'Ativo', // Mocked
        origin: backendData.client?.origin,
        budget_expectation: backendData.budget_expectation,
        move_in_date: backendData.move_in_date,
        avatar: undefined
    };

    const environments: Environment[] = (backendData.rooms || []).map((r: any) => ({
        id: r.id.toString(),
        name: r.name,
        area_sqm: r.area_sqm || r.area || 0,
        urgency_level: r.urgency_level || r.urgency || 'Média',
        observations: r.observations || '',
        status: 'InBatch' // Mock logic for now
    }));

    return {
        id: backendData.id.toString(),
        client,
        created_at: backendData.created_at || new Date().toISOString(),
        environments,
        notes: [], // Fetch separately if needed
        factoryOrders: []
    };
};

// --- API Methods ---

export const fetchProjects = async (): Promise<{ projects: Project[], batches: Batch[] }> => {
    const response = await api.get('/projects');
    const backendProjects = response.data;

    const projects = backendProjects.map(adaptProject);

    // Auto-generate Batches from Projects (since backend doesn't fully handle batches yet)
    // This is temporary until backend has full batch logic
    const batches: Batch[] = projects.map((p: Project) => ({
        id: `b-${p.id}`,
        projectId: p.id,
        name: `Projeto ${p.client.name}`,
        // Map backend project status/stage to frontend step ID
        // Simplified Logic:
        currentStepId: '1.1',
        environmentIds: p.environments.map((e: Environment) => e.id),
        createdAt: p.created_at,
        lastUpdated: p.created_at
    }));

    return { projects, batches };
};

export const createProject = async (clientData: any, envData: any[]) => {
    // Adapter Frontend -> Backend
    const payload = {
        client: {
            name: clientData.name,
            phone: clientData.phone,
            email: clientData.email,
            origin: clientData.origin,
            store_unit: "Matriz" // Default
        },
        project: {
            property_type: "Apartamento", // Default or add to form
            budget_expectation: clientData.budget_expectation,
            move_in_date: clientData.move_in_date,
            purchase_moment: "Imediata"
        },
        rooms: envData.map((e: any) => ({
            name: e.name,
            area: e.area_sqm,
            urgency: e.urgency_level,
            observations: ""
        }))
    };

    const response = await api.post('/projects/full', payload);
    return response.data; // returns { status: "ok", project_id: ... }
};

export default api;
