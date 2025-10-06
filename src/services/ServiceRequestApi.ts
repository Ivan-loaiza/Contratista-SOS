// src/services/ServiceRequestApi.ts
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://localhost:7095/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega token si existe
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===== Tipos ===== */
export interface CreateServiceRequestDto {
  clientId: number;             // userId del cliente (User con rol client)
  serviceId: number;            // id del servicio (Fontanería, etc.)
  contractorId?: number | null; // normalmente null al crear
  description: string;
  location: string;
  urgency: string;              // 'Alta' | 'Media' | 'Baja'
  estimatedDuration: string;    // "2 horas"
  budget: string;               // "$150"
  requestDate: string;          // ISO string
  serviceDate?: string | null;  // ISO o null
  isActive: boolean;
}

export interface ServiceRequestDto {
  requestId: number;
  clientName: string;
  serviceName: string;
  description: string;
  location: string;
  urgency: string;
  estimatedDuration: string;
  budget: string;
  requestTime: string;
}

/* ===== Endpoints ===== */

// POST /api/ServiceRequests
export const createServiceRequest = async (dto: CreateServiceRequestDto) => {
  const res = await API.post('/ServiceRequest', dto);
  return res.data;
};

// GET /api/ServiceRequests
export const getServiceRequests = async (): Promise<ServiceRequestDto[]> => {
  const res = await API.get('/ServiceRequest');
  return res.data;
};

