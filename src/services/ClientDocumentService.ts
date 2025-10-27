import axios from "axios";
import type { Document, DocumentStatus } from "@/types/document";

/**
 * ⚙️ Configuración de Axios con interceptor para token
 */
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "https://localhost:7095/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Adjunta el token JWT en cada request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 📄 Obtiene todos los documentos del cliente autenticado
 * ✅ Ruta real confirmada por Swagger:
 * GET /api/Documents/mine?clientId={clientId}
 */
export async function listDocumentsForClient(clientId: number): Promise<Document[]> {
  const url = `/Documents/mine?clientId=${clientId}`;
  const res = await API.get(url);
  return res.data as Document[];
}

/**
 * 🧰 Obtiene todos los documentos de un contratista
 * GET /api/Documents/contractor/{contractorId}
 */
export async function listDocumentsForContractor(contractorId: number): Promise<Document[]> {
  const url = `/Documents/contractor/${contractorId}`;
  const res = await API.get(url);
  return res.data as Document[];
}

/**
 * 🔍 Obtiene un documento específico por ID
 * GET /api/Documents/{documentId}
 */
export async function getDocumentById(documentId: number): Promise<Document> {
  const url = `/Documents/${documentId}`;
  const res = await API.get(url);
  return res.data as Document;
}

/**
 * 🔄 Actualiza el estado de un documento (p. ej. "Pagada", "Enviada", etc.)
 * PUT /api/Documents/{documentId}/status
 */
export async function updateDocumentStatus(
  documentId: number,
  status: DocumentStatus
): Promise<Document> {
  const url = `/Documents/${documentId}/status`;
  const res = await API.put(url, { status });
  return res.data as Document;
}

/**
 * ➕ Crea un nuevo documento (Cotización, Factura o Proforma)
 * POST /api/Documents
 */
export async function createDocument(
  payload: Omit<Document, "documentId" | "createdAt">
): Promise<Document> {
  const url = `/Documents`;
  const res = await API.post(url, payload);
  return res.data as Document;
}

/**
 * ❌ Elimina un documento (solo para pruebas o administración)
 * DELETE /api/Documents/{documentId}
 */
export async function deleteDocument(documentId: number): Promise<void> {
  const url = `/Documents/${documentId}`;
  await API.delete(url);
}
