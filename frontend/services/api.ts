import axios from 'axios';

const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8000'
    : '/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: { 'Content-Type': 'application/json' }
});

// Injeta o token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('fluxo_erp_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

// Interceptor de resposta: se 401, limpa o token
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('fluxo_erp_token');
            localStorage.removeItem('fluxo_erp_user');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
