// src/types/contractor.ts

/** DTO para crear una aplicación de contratista */
export interface ContractorApplicationCreateDto {
  fullName: string;
  email: string;
  phone: string;
  serviceId: number;
  experienceYears: number;
  availability: "Tiempo completo" | "Medio tiempo" | "Por horas";
  preferredLocation?: string;
  description: string; // resumen o especialidades
}

/** Respuesta básica tras crear una aplicación */
export interface ContractorApplicationResponse {
  contractorApplicationId: number;
  status: string; // "Pending", "Reviewed", "Accepted", "Rejected"
}

/** Modelo completo (equivalente al del backend) */
export interface ContractorApplication {
  contractorApplicationId: number;
  fullName: string;
  email: string;
  phone: string;
  serviceId: number;
  experienceYears: number;
  availability: string;
  preferredLocation?: string | null;
  description: string;
  status: string;
  createdAt: string; // ISO
  reviewNotes?: string | null;

  // opcional: navegación expandida desde backend
  serviceName?: string;
}
