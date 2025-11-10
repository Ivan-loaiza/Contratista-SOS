import { useEffect, useState } from "react";
import { listServices } from "@/services/contractorServiceApi";
import type { Service } from "@/types/service";

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // evitar actualización en componentes desmontados

    async function fetchServices() {
      try {
        setLoading(true);
        setError(null);
        const data = await listServices();

        if (isMounted) setServices(data);
      } catch (err) {
        console.error("Error cargando servicios:", err);
        if (isMounted) setError("No se pudieron cargar los servicios.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchServices();

    return () => {
      isMounted = false; // cleanup
    };
  }, []);

  return {
    services,
    loading,
    error,
    hasServices: services.length > 0,
  };
}
