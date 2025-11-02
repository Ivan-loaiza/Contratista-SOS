import axios from "axios";
import type { ContractorServiceDto, ContractorUser } from "@/types/contractor-service";

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
 * Filtra también los que **no son administradores**.
 */
export async function getContractorsByService(serviceId: number): Promise<ContractorUser[]> {
  const all = await listContractorServices();

  const filtered = all
    .filter(
      (item) =>
        item.serviceId === serviceId &&
        !item.contractor.userRoles?.some(
          (role) => role.name?.toLowerCase() === "admin"
        )
    )
    .map((item) => item.contractor);

  return filtered;
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
