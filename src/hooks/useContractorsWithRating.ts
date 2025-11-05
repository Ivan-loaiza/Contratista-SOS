// src/hooks/useContractorsWithRating.ts
import { useEffect, useState } from "react";
import { getContractorsByService, getAllContractorsFromAllServices } from "@/services/ratingService";
import type { ContractorByService } from "@/types/rating";

/**
 * Hook para obtener contratistas por servicio con estadísticas de calificación
 * Si serviceId es -1, obtiene todos los contratistas de todos los servicios
 */
export function useContractorsWithRating(serviceId: number) {
  const [contractors, setContractors] = useState<ContractorByService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!serviceId) {
      setContractors([]);
      return;
    }

    let isMounted = true;

    async function fetchContractors() {
      try {
        setLoading(true);
        setError(null);

        const data = serviceId === -1
          ? await getAllContractorsFromAllServices()
          : await getContractorsByService(serviceId);

        if (isMounted) setContractors(data);
      } catch (err: any) {
        console.error("Error cargando contratistas:", err);
        const errorMsg = err.response?.data?.message || err.message || "No se pudieron cargar los contratistas.";
        if (isMounted) setError(errorMsg);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchContractors();

    return () => {
      isMounted = false;
    };
  }, [serviceId]);

  return {
    contractors,
    loading,
    error,
    hasContractors: contractors.length > 0,
  };
}
