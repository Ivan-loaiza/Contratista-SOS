// // Tipos equivalentes a los enums de C#
// export type DocumentKind = "Cotizacion" | "Factura" | "Proforma";

// export type DocumentStatus = "Pendiente" | "Pagada" | "Enviada" | "Revision";

// // Item de un documento (equivalente a DocumentItem)
// export interface DocumentItem {
//   itemId: number;
//   documentId: number;
//   description: string;
//   hours: number;
//   rate: number;
//   lineTotal?: number; // propiedad calculada (no persistida)
// }

// // Documento principal (equivalente a Document)
// export interface Document {
//   documentId: number;
//   requestId: number;
//   clientId: number;
//   contractorId: number;
//   kind: DocumentKind;
//   status: DocumentStatus;
//   total: number;
//   notes?: string | null;
//   pdfUrl?: string | null;
//   createdAt: string; // ISO string
//   header?: string | null;
//   footer?: string | null;
//   items: DocumentItem[];

//   // Campos extra para la UI (no están en el modelo C#, pero útiles)
//   contractorName?: string;
//   clientName?: string;
// }
// Tipos equivalentes a los enums de C#
export type DocumentKind = "Cotizacion" | "Factura" | "Proforma";
export type DocumentStatus = "Pendiente" | "Pagada" | "Enviada" | "Revision";

// Item de un documento (equivalente a DocumentItem)
export interface DocumentItem {
  itemId: number;
  documentId: number;
  description: string;
  hours: number;
  rate: number;
  lineTotal?: number; // calculado
}

// Documento principal (modelo completo en C#)
export interface Document {
  documentId: number;
  requestId: number;
  clientId: number;
  contractorId: number;
  kind: DocumentKind;
  status: DocumentStatus;
  total: number;
  notes?: string | null;
  pdfUrl?: string | null;
  createdAt: string; // ISO string
  header?: string | null;
  footer?: string | null;
  items: DocumentItem[];
  contractorName?: string;
  clientName?: string;
}
