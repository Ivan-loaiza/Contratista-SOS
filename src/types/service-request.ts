export type UrgencyLevel = "Alta" | "Media" | "Baja";

export interface CreateServiceRequestDto {
  clientId: number;              // Id del cliente
  serviceId: number;             // Id del servicio
  contractorId: number | null;   // Id del contratista (puede ser null)
  description: string;           // Descripción del trabajo
  location: string;              // Dirección o zona
  urgency: UrgencyLevel;         // Nivel de urgencia ("Alta", "Media", "Baja")
  estimatedDuration: string;     // Ejemplo: "2 horas"
  budget: string;                // Ejemplo: "$150"
  requestDate: string;           // Fecha ISO (se envía como string)
  serviceDate: string | null;    // Fecha opcional (puede ser null)
  isActive: boolean;             // Activo / inactivo
}

/** Historial de solicitud de servicio con información de calificación */
export interface ServiceRequestHistory {
  requestId: number;
  clientId: number;
  clientName: string;
  contractorId: number | null;
  contractorName: string | null;
  contractorAvatarUrl: string | null;
  serviceId: number;
  serviceName: string;
  description: string;
  location: string;
  urgency: UrgencyLevel;
  estimatedDuration: string;
  budget: string;
  requestDate: string;
  serviceDate: string | null;
  isActive: boolean;
  hasRating: boolean;
  ratingStars: number | null;

  // Estados del flujo
  status: string; // "Pendiente" | "Aceptada" | "Finalizada" | "Cancelada"
  acceptedDate: string | null;
  scheduledVisitDate: string | null;
  scheduledVisitTime: string | null;
  visitNotes: string | null;
  completedDate: string | null;

  // Documento de proforma/cotización
  proformaDocumentUrl: string | null;
  proformaUploadedDate: string | null;

  // Información de pago
  paymentStatus: string; // "Pendiente" | "Pagado"
  paymentMethod: string; // "Efectivo" | "Transferencia"
  paymentProofUrl: string | null;
  paidDate: string | null;
}

/** DTO para cancelar solicitud */
export interface CancelRequestDto {
  clientId: number;
  cancellationReason?: string;
}

/** DTO para registrar pago */
export interface RegisterPaymentDto {
  clientId: number;
  paymentMethod: "Efectivo" | "Transferencia";
  paymentProofUrl?: string;
}

/** DTO para subir fotos del problema (Cliente) */
export interface AddClientProblemPhotosDto {
  requestId: number;
  clientId: number;
  photos: File[];
}

/** DTO de respuesta para una foto */
export interface PhotoResponseDto {
  photoId: number;
  requestId: number;
  uploadedBy: number;
  uploaderName: string;
  roleId: number;
  roleName: string;
  photoUrl: string;
  fileName: string;
  photoType: "Problem" | "Before" | "After";
  uploadedAt: string;
}

/** DTO de respuesta para fotos agrupadas */
export interface PhotosGroupedResponseDto {
  requestId: number;
  problemPhotos: PhotoResponseDto[];
  beforePhotos: PhotoResponseDto[];
  afterPhotos: PhotoResponseDto[];
}
