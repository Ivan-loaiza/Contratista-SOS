import { useEffect, useState } from "react";
import { getContractorsByService } from "@/services/contractorServiceApi";
import type { ContractorUser } from "@/types/contractor-service";

export function useContractors(serviceId: number) {
  const [contractors, setContractors] = useState<ContractorUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 🧩 Solo cargar si hay un ID válido
    if (!serviceId) {
      setContractors([]);
      return;
    }

    let isMounted = true; // evitar actualización en componentes desmontados

    async function fetchContractors() {
      try {
        setLoading(true);
        setError(null);
        const data = await getContractorsByService(serviceId);

        if (isMounted) setContractors(data);
      } catch (err) {
        console.error("Error cargando contratistas:", err);
        if (isMounted) setError("No se pudieron cargar los contratistas.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchContractors();

    return () => {
      isMounted = false; // cleanup
    };
  }, [serviceId]);

  return {
    contractors,
    loading,
    error,
    hasContractors: contractors.length > 0,
  };
}
