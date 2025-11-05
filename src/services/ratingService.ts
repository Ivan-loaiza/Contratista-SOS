// src/services/ratingService.ts
import { apiClient } from "./apiClient";
import type {
  ContractorRatingSummary,
  ContractorRating,
  CreateRatingDto,
  RatingCheckResponse,
  ContractorWithRating,
  ContractorByService,
} from "@/types/rating";
import type { ServiceRequestHistory } from "@/types/service-request";

/**
 * Obtiene el resumen completo de calificaciones de un contratista
 */
export async function getContractorRatingSummary(
  contractorId: number
): Promise<ContractorRatingSummary> {
  const response = await apiClient.get(`/Rating/contractor/${contractorId}`);
  return response.data;
}

/**
 * Obtiene todas las calificaciones de un contratista
 */
export async function getAllContractorRatings(
  contractorId: number,
  limit?: number
): Promise<ContractorRating[]> {
  const params = limit ? { limit } : {};
  const response = await apiClient.get(
    `/Rating/contractor/${contractorId}/all`,
    { params }
  );
  return response.data;
}

/**
 * Crea una nueva calificación (requiere autenticación)
 */
export async function createRating(
  ratingData: CreateRatingDto
): Promise<ContractorRating> {
  const response = await apiClient.post("/Rating", ratingData);
  return response.data;
}

/**
 * Verifica si el cliente ya calificó un servicio (requiere autenticación)
 */
export async function checkIfRated(
  requestId: number
): Promise<RatingCheckResponse> {
  const response = await apiClient.get(`/Rating/check/${requestId}`);
  return response.data;
}

/**
 * Obtiene todos los contratistas con estadísticas de calificación
 */
export async function getAllContractors(): Promise<ContractorWithRating[]> {
  const response = await apiClient.get("/Contractor");
  return response.data;
}

/**
 * Obtiene un contratista específico con estadísticas
 */
export async function getContractorById(
  contractorId: number
): Promise<ContractorWithRating> {
  const response = await apiClient.get(`/Contractor/${contractorId}`);
  return response.data;
}

/**
 * Obtiene contratistas filtrados por tipo de servicio
 */
export async function getContractorsByService(
  serviceId: number
): Promise<ContractorByService[]> {
  const response = await apiClient.get(`/ContractorService/service/${serviceId}`);

  const apiResponse = response.data;

  if (!apiResponse.isSuccess || !apiResponse.data) {
    return [];
  }

  return apiResponse.data.map((fullName: string) => ({
    contractorId: 0,
    fullName: fullName,
    email: '',
    phone: '',
    avatarUrl: null,
    serviceId: serviceId,
    serviceName: '',
    averageRating: 0,
    totalRatings: 0,
    completedServicesOfThisType: 0,
    lastServiceDate: null,
  }));
}

/**
 * Obtiene todos los contratistas de todos los servicios
 */
export async function getAllContractorsFromAllServices(): Promise<ContractorByService[]> {
  const response = await apiClient.get("/ContractorService/service");

  const apiResponse = response.data;

  if (!apiResponse.isSuccess || !apiResponse.data) {
    return [];
  }

  return apiResponse.data.map((fullName: string) => ({
    contractorId: 0,
    fullName: fullName,
    email: '',
    phone: '',
    avatarUrl: null,
    serviceId: 0,
    serviceName: 'Todos los servicios',
    averageRating: 0,
    totalRatings: 0,
    completedServicesOfThisType: 0,
    lastServiceDate: null,
  }));
}

/**
 * Obtiene el historial de servicios de un cliente con indicador de calificación
 */
export async function getServiceRequestHistory(
  clientId: number
): Promise<ServiceRequestHistory[]> {
  const response = await apiClient.get(`/ServiceRequest/by-client/${clientId}`);
  return response.data;
}
