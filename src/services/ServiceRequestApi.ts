// src/services/ServiceRequestApi.ts
import axios from "axios";

export const API = axios.create({
  baseURL: "https://localhost:7095/api",
  headers: { "Content-Type": "application/json" },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* ===== Tipos ===== */
export interface CreateServiceRequestDto {
  clientId: number;
  serviceId: number;
  contractorId?: number | null;
  description: string;
  location: string;
  urgency: string;
  estimatedDuration: string;
  budget: string;
  requestDate: string;       // ISO
  serviceDate?: string | null;
  isActive: boolean;
}

export interface ServiceRequestDto {
  requestId: number;
  clientId?: number;
  clientName: string;
  serviceName: string;
  description: string;
  location: string;
  urgency: string;
  estimatedDuration: string;
  budget: string;
  requestTime: string;
}

export interface AcceptServiceRequestPayload {
  contractorId: number;
  contractorName: string;
}
export interface AcceptServiceRequestResponse {
  ok: boolean;
  requestId: number;
  clientId: number;
  contractorId: number;
  contractorName: string;
}

/* ===== Endpoints ===== */
export async function createServiceRequest(dto: CreateServiceRequestDto) {
  const res = await API.post("/ServiceRequest", dto);
  return res.data;
}

export async function getServiceRequests(): Promise<ServiceRequestDto[]> {
  const res = await API.get("/ServiceRequest");
  return res.data;
}

/** 🔹 Export nombrada que te falta */
export async function acceptServiceRequest(
  requestId: number,
  payload: AcceptServiceRequestPayload
): Promise<AcceptServiceRequestResponse> {
  const res = await API.post(`/ServiceRequest/${requestId}/accept`, payload);
  return res.data as AcceptServiceRequestResponse;
}
