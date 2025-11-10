// src/api/serviceApi.ts

export interface ServiceDto {
  serviceId: number;
  name: string;
  description: string;
  imageURL: string | null;
  basePrice: number;
  isActive: boolean;
  createdAt: string; // ISO format
}

// Usa la variable de entorno para la URL base
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL || "https://render-deploy-latest.onrender.com"}/api/Service`;

export async function fetchServices(): Promise<ServiceDto[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error("Error al obtener los servicios.");
  }
  return await response.json();
}
