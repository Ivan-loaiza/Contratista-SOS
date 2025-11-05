import axios from "axios";
import type {
  FavoriteContractorDto,
  MostRequestedContractorDto,
  CreateFavoriteContractorDto,
  UpdateFavoriteNotesDto,
  IsFavoriteResponse,
} from "@/types/favorite-contractor";

// Configuración del cliente Axios
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://localhost:7095/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir el token JWT
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Obtiene todos los contratistas favoritos de un cliente
 * GET /api/FavoriteContractor/client/{clientId}
 */
export async function getFavoritesByClient(
  clientId: number
): Promise<FavoriteContractorDto[]> {
  const res = await API.get<FavoriteContractorDto[]>(
    `/FavoriteContractor/client/${clientId}`
  );
  return res.data;
}

/**
 * Obtiene los contratistas más solicitados por un cliente
 * GET /api/FavoriteContractor/client/{clientId}/most-requested?topN=10
 */
export async function getMostRequestedContractors(
  clientId: number,
  topN: number = 10
): Promise<MostRequestedContractorDto[]> {
  const res = await API.get<MostRequestedContractorDto[]>(
    `/FavoriteContractor/client/${clientId}/most-requested`,
    { params: { topN } }
  );
  return res.data;
}

/**
 * Agrega un contratista a favoritos
 * POST /api/FavoriteContractor
 */
export async function addFavorite(
  payload: CreateFavoriteContractorDto
): Promise<FavoriteContractorDto> {
  const res = await API.post<FavoriteContractorDto>("/FavoriteContractor", payload);
  return res.data;
}

/**
 * Remueve un contratista de favoritos (soft delete)
 * DELETE /api/FavoriteContractor/{id}
 */
export async function removeFavorite(id: number): Promise<void> {
  await API.delete(`/FavoriteContractor/${id}`);
}

/**
 * Actualiza las notas de un favorito
 * PATCH /api/FavoriteContractor/{id}/notes
 */
export async function updateFavoriteNotes(
  id: number,
  payload: UpdateFavoriteNotesDto
): Promise<FavoriteContractorDto> {
  const res = await API.patch<FavoriteContractorDto>(
    `/FavoriteContractor/${id}/notes`,
    payload
  );
  return res.data;
}

/**
 * Verifica si un contratista es favorito
 * GET /api/FavoriteContractor/client/{clientId}/contractor/{contractorId}/is-favorite
 */
export async function isFavorite(
  clientId: number,
  contractorId: number
): Promise<boolean> {
  const res = await API.get<IsFavoriteResponse>(
    `/FavoriteContractor/client/${clientId}/contractor/${contractorId}/is-favorite`
  );
  return res.data.isFavorite;
}
