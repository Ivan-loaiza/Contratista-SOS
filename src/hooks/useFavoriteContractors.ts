import { useEffect, useState, useCallback } from "react";
import {
  getFavoritesByClient,
  getMostRequestedContractors,
  addFavorite,
  removeFavorite,
} from "@/services/favoriteContractorApi";
import type {
  FavoriteContractorDto,
  MostRequestedContractorDto,
  CreateFavoriteContractorDto,
} from "@/types/favorite-contractor";

export function useFavoriteContractors(clientId: number | undefined) {
  const [favorites, setFavorites] = useState<FavoriteContractorDto[]>([]);
  const [mostRequested, setMostRequested] = useState<MostRequestedContractorDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar favoritos
  const loadFavorites = useCallback(async () => {
    if (!clientId) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getFavoritesByClient(clientId);
      setFavorites(data);
    } catch (err) {
      console.error("Error cargando favoritos:", err);
      setError("No se pudieron cargar los contratistas favoritos.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Cargar contratistas más solicitados
  const loadMostRequested = useCallback(async (topN: number = 10) => {
    if (!clientId) {
      setMostRequested([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getMostRequestedContractors(clientId, topN);
      setMostRequested(data);
    } catch (err) {
      console.error("Error cargando más solicitados:", err);
      setError("No se pudieron cargar los contratistas más solicitados.");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Agregar a favoritos
  const addToFavorites = useCallback(
    async (payload: CreateFavoriteContractorDto) => {
      try {
        setError(null);
        const newFavorite = await addFavorite(payload);
        setFavorites((prev) => [...prev, newFavorite]);

        // Actualizar el estado de isFavorite en la lista de más solicitados
        setMostRequested((prev) =>
          prev.map((contractor) =>
            contractor.contractorId === payload.contractorId
              ? { ...contractor, isFavorite: true }
              : contractor
          )
        );

        return newFavorite;
      } catch (err: any) {
        console.error("Error agregando a favoritos:", err);
        const message =
          err?.response?.status === 409
            ? "Este contratista ya está en favoritos."
            : "No se pudo agregar a favoritos.";
        setError(message);
        throw err;
      }
    },
    []
  );

  // Remover de favoritos
  const removeFromFavorites = useCallback(
    async (favoriteId: number, contractorId: number) => {
      try {
        setError(null);
        await removeFavorite(favoriteId);
        setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));

        // Actualizar el estado de isFavorite en la lista de más solicitados
        setMostRequested((prev) =>
          prev.map((contractor) =>
            contractor.contractorId === contractorId
              ? { ...contractor, isFavorite: false }
              : contractor
          )
        );
      } catch (err) {
        console.error("Error removiendo de favoritos:", err);
        setError("No se pudo remover de favoritos.");
        throw err;
      }
    },
    []
  );

  // Cargar favoritos al montar o cuando cambia el clientId
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites,
    mostRequested,
    loading,
    error,
    hasFavorites: favorites.length > 0,
    addToFavorites,
    removeFromFavorites,
    loadFavorites,
    loadMostRequested,
  };
}
