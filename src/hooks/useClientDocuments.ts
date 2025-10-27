// src/hooks/useClientDocuments.ts
import { useState, useEffect } from "react";
import { listDocumentsForClient } from "@/services/ClientDocumentService";
import type { Document } from "@/types/document"; 

export function useClientDocuments(clientId?: number) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false; // evita actualizar el estado si se desmonta

    const fetchDocs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listDocumentsForClient(clientId);
        if (!cancelled) setDocs(data);
      } catch (err: any) {
        if (!cancelled) setError(err.message ?? "Error al cargar documentos");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDocs();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  return { docs, loading, error };
}
