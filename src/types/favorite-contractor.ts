/**
 * FavoriteContractorDto - Información completa de un contratista favorito
 */
export interface FavoriteContractorDto {
  id: number;
  clientId: number;
  clientName: string;
  contractorId: number;
  contractorName: string;
  contractorEmail: string | null;
  contractorPhone: string | null;
  contractorAvatarUrl: string | null;
  createdAt: string;
  notes: string | null;
  isActive: boolean;
  totalServicesCompleted: number;
  averageRating: number;
}

/**
 * MostRequestedContractorDto - Contratistas más solicitados con indicador de favorito
 */
export interface MostRequestedContractorDto {
  contractorId: number;
  contractorName: string;
  contractorEmail: string | null;
  contractorPhone: string | null;
  contractorAvatarUrl: string | null;
  totalRequests: number;
  lastRequestDate: string;
  averageRating: number;
  isFavorite: boolean;
}

/**
 * CreateFavoriteContractorDto - Para agregar un nuevo favorito
 */
export interface CreateFavoriteContractorDto {
  clientId: number;
  contractorId: number;
  notes?: string;
}

/**
 * UpdateFavoriteNotesDto - Para actualizar las notas de un favorito
 */
export interface UpdateFavoriteNotesDto {
  notes: string;
}

/**
 * IsFavoriteResponse - Respuesta de verificación de favorito
 */
export interface IsFavoriteResponse {
  isFavorite: boolean;
}
