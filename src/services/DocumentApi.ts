// src/services/DocumentApi.ts
import axios from "axios";

/** Ajusta la base según tu .env o deja el fallback al https local */
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://localhost:7095";

/** Tipos de documento soportados por el backend */
// Para enviar al backend (números)
export type DocumentKind = 0 | 1;  // 0 = Cotizacion, 1 = Factura
// Para recibir del backend (strings)
export type DocumentKindResponse = "Cotizacion" | "Factura";

/** Tipos de item en un documento */
export type DocumentItemType = 0 | 1;  // 0 = Service (horas × tarifa), 1 = Material (cantidad × precio unitario)

/** Estado del documento */
// Para enviar al backend (números)
export type DocumentStatus = 0 | 1;  // 0 = Pendiente, 1 = Pagado
// Para recibir del backend (strings)
export type DocumentStatusResponse = "Pendiente" | "Pagado";

/** Item de documento - puede ser servicio o material */
export interface CreateDocumentItemDto {
  itemType: DocumentItemType;
  description: string;

  // Campos para SERVICIOS (itemType = 0)
  hours?: number;
  hourlyRate?: number;

  // Campos para MATERIALES (itemType = 1)
  quantity?: number;
  unit?: string;        // "metros", "kg", "unidades", etc.
  unitPrice?: number;
}

/** DTO para crear documento */
export interface CreateDocumentDto {
  requestId: number;
  clientId: number;
  contractorId: number;
  kind: DocumentKind;
  total?: number;  // Opcional, se calcula automáticamente
  items: CreateDocumentItemDto[];
  notes?: string;
}

/** Respuesta al crear/listar documento */
export interface ClientDocumentDto {
  id: number;
  requestId: number;
  contractorId: number;
  contractorName: string;
  contractorEmail?: string;
  contractorPhone?: string | null;
  contractorAddress?: string | null;
  contractorAvatarUrl?: string | null;
  kind: DocumentKindResponse;  // El backend devuelve string
  amount: number;
  date: string;
  status: DocumentStatusResponse;  // El backend devuelve string
  pdfUrl?: string;
}

/** Documento completo con items */
export interface DocumentDetailDto {
  documentId: number;
  requestId: number;
  clientId: number;
  contractorId: number;
  kind: DocumentKind;
  status: DocumentStatus;
  total: number;
  notes?: string | null;
  createdAt: string;
  pdfUrl?: string | null;
  items: DocumentItemDetailDto[];
}

/** Item de documento con detalles */
export interface DocumentItemDetailDto {
  itemId: number;
  documentId: number;
  itemType: DocumentItemType;
  description: string;
  hours?: number | null;
  hourlyRate?: number | null;
  quantity?: number | null;
  unit?: string | null;
  unitPrice?: number | null;
}

/** DTO para registrar pago */
export interface RegisterPaymentDto {
  clientId: number;
  paymentMethod: "Efectivo" | "Transferencia";
  paymentProofUrl?: string;
  notes?: string;
}

/** Respuesta al registrar pago */
export interface RegisterPaymentResultDto {
  success: boolean;
  message: string;
  documentId: number;
  requestId: number;
  paymentStatus: string;
  paymentMethod: string;
  paidDate: string;
}

/** Crea un documento para una solicitud aceptada */
export async function createDocument(dto: CreateDocumentDto, contractorId: number) {
  const url = `${API_BASE}/api/Documents?contractorId=${contractorId}`;
  const res = await axios.post(url, dto);
  return res.data as ClientDocumentDto;
}

/** Lista los documentos del cliente */
export async function listMyDocuments(clientId: number) {
  const url = `${API_BASE}/api/Documents/mine?clientId=${clientId}`;
  const res = await axios.get(url);
  const documents = res.data as ClientDocumentDto[];

  // Convertir URLs relativas a absolutas
  return documents.map(doc => ({
    ...doc,
    pdfUrl: doc.pdfUrl ? `${API_BASE}${doc.pdfUrl}` : undefined
  }));
}

/** Obtiene documentos por solicitud */
export async function getDocumentsByRequest(requestId: number) {
  const url = `${API_BASE}/api/Documents/by-request/${requestId}`;
  const res = await axios.get(url);
  return res.data as DocumentDetailDto[];
}

/** Registra el pago de un documento */
export async function registerDocumentPayment(documentId: number, dto: RegisterPaymentDto) {
  const url = `${API_BASE}/api/Documents/${documentId}/pay`;
  const res = await axios.post(url, dto);
  return res.data as RegisterPaymentResultDto;
}
