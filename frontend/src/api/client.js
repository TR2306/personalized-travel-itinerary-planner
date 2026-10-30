import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject bearer token and optional custom Gemini API key
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('roamai_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const customGeminiKey = localStorage.getItem('roamai_gemini_key');
  if (customGeminiKey && customGeminiKey.trim()) {
    config.headers['X-Gemini-Key'] = customGeminiKey.trim();
  }
  return config;
}, (error) => Promise.reject(error));

export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/me', data),
};

export const tripsApi = {
  list: () => apiClient.get('/trips'),
  create: (data) => apiClient.post('/trips', data),
  get: (id) => apiClient.get(`/trips/${id}`),
  update: (id, data) => apiClient.put(`/trips/${id}`, data),
  delete: (id) => apiClient.delete(`/trips/${id}`),
  duplicate: (id) => apiClient.post(`/trips/${id}/duplicate`),
  getPdfUrl: (id) => `${API_BASE_URL}/trips/${id}/pdf`,
};

export const itineraryApi = {
  generate: (data) => apiClient.post('/itinerary/generate', data),
  regenerate: (data) => apiClient.post('/itinerary/regenerate', data),
  regenerateDay: (data) => apiClient.post('/itinerary/regenerate-day', data),
  save: (data) => apiClient.post('/itinerary/save', data),
  exportPdf: (itineraryData) => apiClient.post('/itinerary/export-pdf', itineraryData, { responseType: 'blob' }),
};

export const healthApi = {
  check: () => apiClient.get('/health'),
};

export default apiClient;
