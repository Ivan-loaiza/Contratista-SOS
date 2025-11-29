// src/services/ServiceRequestApi.ts
import axios from "axios";

export const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL || "https://render-deploy-latest.onrender.com"}/api`,
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
  scheduledVisitDate?: string; // ISO format, opcional
  scheduledVisitTime?: string; // Opcional
  visitNotes?: string; // Opcional
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

/** 🔹 Aceptar solicitud (Contratista) */
export async function acceptServiceRequest(
  requestId: number,
  payload: AcceptServiceRequestPayload
): Promise<AcceptServiceRequestResponse> {
  const res = await API.post(`/ServiceRequest/${requestId}/accept`, payload);
  return res.data as AcceptServiceRequestResponse;
}

/** 🔹 Cancelar solicitud (Cliente) */
export async function cancelServiceRequest(requestId: number, clientId: number): Promise<{ message: string }> {
  const res = await API.post(`/ServiceRequest/${requestId}/cancel`, { clientId });
  return res.data;
}

/** 🔹 Marcar como finalizado (Contratista) */
export async function markServiceRequestCompleted(requestId: number, contractorId: number): Promise<{ message: string }> {
  const res = await API.post(`/ServiceRequest/${requestId}/mark-completed`, { contractorId });
  return res.data;
}

/** 🔹 Registrar pago (Cliente) */
export async function registerPayment(
  requestId: number,
  payload: { clientId: number; paymentMethod: string; paymentProofUrl?: string }
): Promise<{ message: string }> {
  const res = await API.post(`/ServiceRequest/${requestId}/register-payment`, payload);
  return res.data;
}

/** 🔹 Programar visita (Contratista) */
export async function scheduleVisit(
  requestId: number,
  payload: {
    contractorId: number;
    visitDate: string;
    visitTime: string;
    notes?: string;
  }
): Promise<{ message: string }> {
  const res = await API.post(`/ServiceRequest/${requestId}/schedule-visit`, payload);
  return res.data;
}

/** 🔹 Interfaz para solicitudes del contratista */
export interface ContractorServiceRequest {
  requestId: number;
  clientId: number;
  clientName: string;
  contractorId: number;
  contractorName: string;
  contractorAvatarUrl: string | null;
  serviceId: number;
  serviceName: string;
  description: string;
  location: string;
  urgency: string;
  additionalDetails: string;
  budget: string;
  requestDate: string;
  serviceDate: string | null;
  isActive: boolean;
  status: string; // "Pendiente" | "Aceptada" | "Finalizada" | "Cancelada"
  scheduledVisitDate: string | null;
  scheduledVisitTime: string | null;
  visitNotes: string | null;
  hasRating: boolean;
  ratingStars: number | null;
  // Campos adicionales que pueden venir del backend
  proformaDocumentUrl?: string | null;
  completedDate?: string | null;
  paymentStatus?: string | null;
  paymentProofUrl?: string | null;
  acceptedDate?: string | null;
  proformaUploadedDate?: string | null;
  paidDate?: string | null;
  paymentMethod?: string | null;
}

/** 🔹 Obtener solicitudes del contratista */
export async function getContractorRequests(contractorId: number): Promise<ContractorServiceRequest[]> {
  const res = await API.get(`/ServiceRequest/by-contractor/${contractorId}`);
  return res.data;
}

/* ===== FOTOS DE SERVICIO ===== */

/** 🔹 Interfaz para respuesta de foto */
export interface PhotoResponseDto {
  photoId: number;
  requestId: number;
  uploadedBy: number;
  uploaderName: string;
  roleId: number;
  roleName: string;
  photoUrl: string;
  fileName: string;
  photoType: "Problem" | "Before" | "After";
  uploadedAt: string;
}

/** 🔹 Subir fotos del problema (Cliente) */
export async function uploadProblemPhotos(
  requestId: number,
  clientId: number,
  photos: File[]
): Promise<PhotoResponseDto[]> {
  const formData = new FormData();
  formData.append("RequestId", requestId.toString());
  formData.append("ClientId", clientId.toString());

  photos.forEach((photo) => {
    formData.append("Photos", photo);
  });

  const res = await API.post("/ServiceRequestPhotos/problem", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

/** 🔹 Obtener fotos del problema */
export async function getProblemPhotos(requestId: number): Promise<PhotoResponseDto[]> {
  const res = await API.get(`/ServiceRequestPhotos/problem/${requestId}`);
  return res.data;
}
