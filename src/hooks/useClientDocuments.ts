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
import { useState, useEffect } from "react";
import { listDocumentsForClient } from "@/services/ClientDocumentService";
import type { Document } from "@/types/document";

/**
 * Hook personalizado para obtener los documentos del cliente autenticado
 */
export function useClientDocuments(clientId?: number) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    const fetchDocs = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await listDocumentsForClient(clientId);

        // 🔁 Adaptamos los campos del DTO (Swagger) al modelo Document del frontend
        const mapped: Document[] = data.map((d: any) => ({
          documentId: d.id,
          requestId: d.requestId,
          clientId: 0, // si no lo devuelve la API
          contractorId: 0, // si no lo devuelve la API
          kind: d.kind,
          status: d.status,
          total: d.amount, // 👈 el total real
          notes: null,
          pdfUrl: d.pdfUrl ?? null,
          createdAt: d.date,
          header: null,
          footer: null,
          items: [],
          contractorName: d.contractorName,
          clientName: undefined,
        }));

        if (!cancelled) setDocs(mapped);
      } catch (err: any) {
        if (!cancelled)
          setError(err.message ?? "Error al cargar documentos del cliente");
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
