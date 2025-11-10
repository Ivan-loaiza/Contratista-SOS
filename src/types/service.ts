/**
 * Service - Representa un servicio que puede ser ofrecido por contratistas
 */
export interface Service {
  serviceId: number;
  name: string;
  description?: string | null;
}

/**
 * CreateServiceDto - DTO para crear un nuevo servicio
 */
export interface CreateServiceDto {
  name: string;
  description?: string;
}

/**
 * UpdateServiceDto - DTO para actualizar un servicio existente
 */
export interface UpdateServiceDto {
  name?: string;
  description?: string;
}
