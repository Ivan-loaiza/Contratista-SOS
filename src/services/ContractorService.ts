// // src/services/contractorService.ts
// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'https://localhost:7095/api', // ✅ tu ruta base
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // 🔎 Obtener solicitudes de servicio
// export const getServiceRequests = async () => {
//   const response = await API.get('/ServiceRequests');
//   return response.data;
// };
// src/services/ContractorService.ts
import axios from "axios";
import type {
  ContractorApplication,
  ContractorApplicationCreateDto,
  ContractorApplicationResponse,
} from "@/types/contractor";

// 🔧 Configuración base del cliente Axios
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://localhost:7095/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor: adjunta el token JWT automáticamente
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//
// 📍 ENDPOINTS DEL SERVICIO
//

/**
 * 🧾 Obtiene todas las solicitudes de contratistas
 * GET /api/contractor-applications
 */
export async function listContractorApplications(): Promise<ContractorApplication[]> {
  const res = await API.get("/contractor-applications");
  return res.data as ContractorApplication[];
}

/**
 * 🔍 Obtiene una aplicación específica por ID
 * GET /api/contractor-applications/{id}
 */
export async function getContractorApplicationById(
  id: number
): Promise<ContractorApplication> {
  const res = await API.get(`/contractor-applications/${id}`);
  return res.data as ContractorApplication;
}

/**
 * ✍️ Crea una nueva aplicación de contratista
 * POST /api/contractor-applications
 */
export async function createContractorApplication(
  payload: ContractorApplicationCreateDto
): Promise<ContractorApplicationResponse> {
  const res = await API.post("/contractor-applications", payload);
  return res.data as ContractorApplicationResponse;
}

/**
 * 🔄 Actualiza el estado de una aplicación (ej. "Accepted", "Rejected")
 * PUT /api/contractor-applications/{id}/status
 */
export async function updateContractorApplicationStatus(
  id: number,
  status: string,
  reviewNotes?: string
): Promise<ContractorApplication> {
  const res = await API.put(`/contractor-applications/${id}/status`, {
    status,
    reviewNotes,
  });
  return res.data as ContractorApplication;
}

/**
 * 🗑️ Elimina una aplicación de contratista
 * DELETE /api/contractor-applications/{id}
 */
export async function deleteContractorApplication(id: number): Promise<void> {
  await API.delete(`/contractor-applications/${id}`);
}
