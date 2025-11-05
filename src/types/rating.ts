// src/types/rating.ts

/** Información básica de una calificación individual */
export interface ContractorRating {
  ratingId: number;
  contractorId: number;
  contractorName: string;
  contractorAvatarUrl: string | null;
  clientId: number;
  clientName: string;
  requestId: number;
  serviceName: string;
  stars: number;
  comment: string | null;
  date: string;
}

/** Resumen completo de calificaciones de un contratista */
export interface ContractorRatingSummary {
  contractorId: number;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  contractorAvatarUrl: string | null;
  averageRating: number;
  totalRatings: number;
  totalServicesCompleted: number;
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
  recentReviews: ContractorRating[];
}

/** DTO para crear una nueva calificación */
export interface CreateRatingDto {
  requestId: number;
  contractorId: number;
  stars: number;
  comment?: string;
}

/** Respuesta al verificar si ya calificó */
export interface RatingCheckResponse {
  hasRated: boolean;
}

/** Contratista con estadísticas de calificación (para lista) */
export interface ContractorWithRating {
  contractorId: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
  services: ServiceInfo[];
  averageRating: number;
  totalRatings: number;
  completedServices: number;
}

/** Información de un servicio */
export interface ServiceInfo {
  serviceId: number;
  serviceName: string;
}

/** Contratista filtrado por servicio con estadísticas */
export interface ContractorByService {
  contractorId: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  serviceId: number;
  serviceName: string;
  averageRating: number;
  totalRatings: number;
  completedServicesOfThisType: number;
  lastServiceDate: string | null;
}
