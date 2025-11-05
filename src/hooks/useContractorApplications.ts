// src/hooks/useContractorApplications.ts
import { useState, useEffect } from "react";
import { listContractorApplications } from "@/services/ContractorService";
import type { ContractorApplication } from "@/types/contractor";

export function useContractorApplications() {
  const [applications, setApplications] = useState<ContractorApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listContractorApplications();
        if (!cancelled) setApplications(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Error al cargar solicitudes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  return { applications, loading, error };
}
