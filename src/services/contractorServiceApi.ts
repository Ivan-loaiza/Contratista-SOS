import axios from "axios";
import type { ContractorServiceDto, ContractorUser } from "@/types/contractor-service";
import type { Service } from "@/types/service";

// 🔧 Configuración del cliente Axios
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://localhost:7095/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Interceptor para incluir el token JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

//
// 📍 ENDPOINTS DEL MÓDULO ContractorService
//

/**
 * 🔹 Lista todas las relaciones entre contratistas y servicios.
 * GET /api/ContractorService
 */
export async function listContractorServices(): Promise<ContractorServiceDto[]> {
  const res = await API.get("/ContractorService");
  return res.data as ContractorServiceDto[];
}

/**
 * 🔹 Obtiene los contratistas que ofrecen un servicio específico.
 * Usa el endpoint: GET /api/ContractorService/service/{serviceId}
 */
export async function getContractorsByService(serviceId: number): Promise<ContractorUser[]> {
  const response = await API.get(`/ContractorService/service/${serviceId}`);

  const apiResponse = response.data;

  if (!apiResponse.isSuccess || !apiResponse.data) {
    return [];
  }

  return apiResponse.data.map((fullName: string) => ({
    userId: 0,
    fullName: fullName,
    email: '',
    phone: '',
    avatarUrl: null,
    isActive: true,
    userRoles: [],
  }));
}

/**
 * 🔹 Lista todos los servicios de un contratista dado.
 * GET /api/ContractorService/{contractorId}
 */
export async function getServicesByContractor(
  contractorId: number
): Promise<ContractorServiceDto[]> {
  const res = await API.get(`/ContractorService/${contractorId}`);
  return res.data as ContractorServiceDto[];
}

/**
 * 🔹 Asigna un nuevo servicio a un contratista.
 * POST /api/ContractorService
 */
export async function assignServiceToContractor(payload: {
  contractorId: number;
  serviceId: number;
}): Promise<ContractorServiceDto> {
  const res = await API.post("/ContractorService", payload);
  return res.data as ContractorServiceDto;
}

/**
 * 🔹 Elimina un servicio asignado a un contratista.
 * DELETE /api/ContractorService/{id}
 */
export async function deleteContractorService(id: number): Promise<void> {
  await API.delete(`/ContractorService/${id}`);
}

/**
 * 🔹 Lista todos los servicios disponibles en el sistema.
 * GET /api/Service
 */
export async function listServices(): Promise<Service[]> {
  const res = await API.get<Service[]>("/Service");
  return res.data;
}
