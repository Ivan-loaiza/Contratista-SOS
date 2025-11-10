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
 * Obtiene todos los contratistas de todos los servicios con estadísticas completas
 */
export async function getAllContractorsFromAllServices(): Promise<ContractorByService[]> {
  const response = await apiClient.get("/Contractor");
  const contractors: ContractorWithRating[] = response.data;

  if (!contractors || contractors.length === 0) {
    return [];
  }

  // Transformar ContractorWithRating[] a ContractorByService[]
  // Creando una entrada por cada servicio que ofrece el contratista
  const result: ContractorByService[] = [];

  contractors.forEach((contractor) => {
    if (contractor.services && contractor.services.length > 0) {
      contractor.services.forEach((service) => {
        result.push({
          contractorId: contractor.contractorId,
          fullName: contractor.fullName,
          email: contractor.email,
          phone: contractor.phone,
          avatarUrl: contractor.avatarUrl,
          serviceId: service.serviceId,
          serviceName: service.serviceName,
          averageRating: contractor.averageRating,
          totalRatings: contractor.totalRatings,
          completedServicesOfThisType: contractor.completedServices,
          lastServiceDate: null, // Este dato no está disponible en ContractorWithRating
        });
      });
    } else {
      // Si no tiene servicios, crear una entrada sin servicio específico
      result.push({
        contractorId: contractor.contractorId,
        fullName: contractor.fullName,
        email: contractor.email,
        phone: contractor.phone,
        avatarUrl: contractor.avatarUrl,
        serviceId: 0,
        serviceName: 'Sin servicio asignado',
        averageRating: contractor.averageRating,
        totalRatings: contractor.totalRatings,
        completedServicesOfThisType: contractor.completedServices,
        lastServiceDate: null,
      });
    }
  });

  return result;
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
