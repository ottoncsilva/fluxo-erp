import axios from 'axios';

// Detecta URL dinamicamente
const API_URL = window.env?.VITE_API_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: API_URL,
});

export const createFullProject = async (data) => {
    const response = await api.post('/projects/full', data);
    return response.data;
};

export const getKanbanProjects = async () => {
    const response = await api.get('/kanban');
    return response.data;
};

export default api;
