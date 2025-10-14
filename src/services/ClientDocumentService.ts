import axios from "axios";

/** Ajusta tu base de API desde las variables de entorno */
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://localhost:7095";

/** Tipos de documento */
export type DocKind = "cotizacion" | "factura" | "proforma";

/** Estado del documento */
export type DocumentStatus = "Pendiente" | "Pagada" | "Enviada" | "Revisión";

/** Documento recibido por cliente */
export interface ClientDocumentDto {
  id: number;
  requestId: number;
  kind: DocKind;
  clientName: string;
  amount: number;
  date: string; // ISO
  status: DocumentStatus;
  pdfUrl?: string | null;
}

/**
 * Obtiene los documentos asociados a un cliente autenticado
 */
export async function listDocumentsForClient(clientId: number) {
  const url = `${API_BASE}/api/Documents/mine?clientId=${clientId}`;
  const res = await axios.get(url);
  return res.data as ClientDocumentDto[];
}
