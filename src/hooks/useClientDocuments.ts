// // src/hooks/useClientDocuments.ts
// import { useState, useEffect } from "react";
// import { listDocumentsForClient } from "@/services/ClientDocumentService";
// import type { Document } from "@/types/document"; 

// export function useClientDocuments(clientId?: number) {
//   const [docs, setDocs] = useState<Document[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (!clientId) return;
//     let cancelled = false; // evita actualizar el estado si se desmonta

//     const fetchDocs = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const data = await listDocumentsForClient(clientId);
//         if (!cancelled) setDocs(data);
//       } catch (err: any) {
//         if (!cancelled) setError(err.message ?? "Error al cargar documentos");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     };

//     fetchDocs();
//     return () => {
//       cancelled = true;
//     };
//   }, [clientId]);

//   return { docs, loading, error };
// }
import { useState, useEffect, useCallback } from "react";
import { listMyDocuments } from "@/services/DocumentApi";
import type { ClientDocumentDto } from "@/services/DocumentApi";

/**
 * Hook personalizado para obtener los documentos del cliente autenticado
 * Retorna directamente el DTO simplificado del Swagger
 */
export function useClientDocuments(clientId?: number) {
  const [docs, setDocs] = useState<ClientDocumentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocs = useCallback(async () => {
    if (!clientId) {
      setDocs([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await listMyDocuments(clientId);
      setDocs(data);
    } catch (err: any) {
      console.error("Error cargando documentos:", err);
      setError(err.message ?? "Error al cargar documentos del cliente");
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  return {
    docs,
    loading,
    error,
    hasDocs: docs.length > 0,
    refetch: fetchDocs
  };
}
