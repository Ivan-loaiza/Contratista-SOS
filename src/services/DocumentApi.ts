// src/services/DocumentApi.ts
import axios from "axios";

/** Ajusta la base según tu .env o deja el fallback al https local */
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://localhost:7095";

/** Tipos de documento soportados por el backend */
export type DocKind = "cotizacion" | "factura" | "proforma";

/** Ítems de la cotización/factura/proforma */
export interface DocumentItemDto {
  description: string;
  hours: number; // horas
  rate: number;  // tarifa x hora
}

/** ✅ DTO para crear documento (incluye 'kind') */
export interface CreateDocumentDto {
  requestId: number;          // id de la ServiceRequest asociada
  kind: DocKind;              // <-- faltaba este campo en tu tipo
  items: DocumentItemDto[];   // detalle
  total: number;              // total calculado
  notes?: string;             // opcional
}

/** Lo que devuelve el backend al listar mis documentos enviados */
export interface OutgoingDocument {
  id: number;
  requestId: number;
  kind: DocKind;
  clientName: string;
  amount: number;
  date: string; // ISO
  status: "Pendiente" | "Pagada" | "Enviada" | "Revisión";
  pdfUrl?: string | null;
}

/** Crea un documento para una solicitud aceptada */
export async function createDocument(dto: CreateDocumentDto, contractorId: number) {
  const url = `${API_BASE}/api/Documents?contractorId=${contractorId}`;
  const res = await axios.post(url, dto);
  return res.data as { id: number };
}

/** Lista los documentos del contratista autenticado */
export async function listMyDocuments() {
  // Ajusta si tu endpoint es /api/Documents/contractor o similar
  const url = `${API_BASE}/api/Documents/mine`;
  const res = await axios.get(url);
  return res.data as OutgoingDocument[];
}

/** (Opcional) lista documentos de un cliente específico */
export async function listClientDocuments(clientId: number) {
  const url = `${API_BASE}/api/Documents/client/${clientId}`;
  const res = await axios.get(url);
  return res.data as OutgoingDocument[];
}
