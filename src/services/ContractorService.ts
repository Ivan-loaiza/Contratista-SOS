// src/services/contractorService.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:7095/api', // ✅ tu ruta base
  headers: {
    'Content-Type': 'application/json',
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔎 Obtener solicitudes de servicio
export const getServiceRequests = async () => {
  const response = await API.get('/ServiceRequests');
  return response.data;
};
