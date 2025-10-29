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

// Puedes mover esta URL a una variable de entorno si lo deseas
const BASE_URL = "https://localhost:7095/api/Service";

export async function fetchServices(): Promise<ServiceDto[]> {
  const response = await fetch(BASE_URL);
  if (!response.ok) {
    throw new Error("Error al obtener los servicios.");
  }
  return await response.json();
}
