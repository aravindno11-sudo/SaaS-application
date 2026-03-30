import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
};

export const workspaces = {
  getAll: () => api.get('/workspaces'),
  create: (data: any) => api.post('/workspaces', data),
};

export const documents = {
  getAll: (workspaceId: string) => api.get(`/documents/workspace/${workspaceId}`),
  getById: (id: string) => api.get(`/documents/${id}`),
  create: (data: any) => api.post('/documents', data),
  update: (id: string, data: any) => api.put(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const subscription = {
  createCheckoutSession: (workspaceId: string) =>
    api.post('/subscription/create-checkout-session', { workspaceId }),
};

export const activity = {
  getActivity: (workspaceId: string) => api.get(`/activity/${workspaceId}`),
  getStats: (workspaceId: string) => api.get(`/activity/${workspaceId}/stats`),
};

export default api;
