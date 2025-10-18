import axios from 'axios';

// Dynamic API URL configuration
const getApiBaseUrl = () => {
    // If in development mode
    if (import.meta.env.DEV) {
        return import.meta.env.VITE_API_URL || 'http://localhost:8000';
    }
    
    // For Vercel production deployment
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    
    // For local Nginx deployment
    // Use relative URL so it works with any hostname/IP
    return '/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Items API
export const itemsAPI = {
    getAll: () => api.get('/items/'),
    getById: (id) => api.get(`/items/${id}`),
    create: (data) => api.post('/items/add', data),
    update: (id, data) => api.put(`/items/${id}`, data),
    delete: (id) => api.delete(`/items/${id}`),
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/categories/'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories/add', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getCategoryDistribution: () => api.get('/dashboard/category-distribution'),
};

// Stock Movements API
export const stockMovementsAPI = {
    getAll: (params = {}) => api.get('/stock-movements/', { params }),
    getById: (id) => api.get(`/stock-movements/${id}`),
    create: (data) => api.post('/stock-movements/', data),
    delete: (id) => api.delete(`/stock-movements/${id}`),
    getSummary: () => api.get('/stock-summary/'),
    getByItemId: (itemId, params = {}) => api.get(`/items/${itemId}/stock-movements/`, { params }),
};

// Payments API
export const paymentsAPI = {
    getAll: () => api.get('/payments/'),
    getById: (id) => api.get(`/payments/${id}`),
    create: (data) => api.post('/payments/', data),
    update: (id, data) => api.put(`/payments/${id}`, data),
    delete: (id) => api.delete(`/payments/${id}`),
};

// Authentication API
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
};

export default api;