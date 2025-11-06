// src/components/contractor/ServiceDetailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  MapPin,
  //Clock,
  DollarSign,
  Calendar,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  //Star,
} from "lucide-react";
import type { ContractorServiceRequest } from "@/services/ServiceRequestApi";

interface ServiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ContractorServiceRequest | null;
}

// Función para inferir el status
const getStatus = (request: ContractorServiceRequest): string => {
  if (request.completedDate) {
    return request.paymentStatus === "Pagado" ? "Pagado" : "Finalizada";
  }
  if (request.proformaDocumentUrl) {
    return "Cotización Enviada";
  }
  if (request.scheduledVisitDate) {
    return "Visita Programada";
  }
  return "Aceptada";
};

export function ServiceDetailModal({ isOpen, onClose, request }: ServiceDetailModalProps) {
  if (!request) return null;

  const status = getStatus(request);
  const paymentStatus = request.paymentStatus || "Pendiente";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pendiente":
        return "bg-yellow-100 text-yellow-700";
      case "Aceptada":
        return "bg-blue-100 text-blue-700";
      case "Finalizada":
        return "bg-green-100 text-green-700";
      case "Cancelada":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    return status === "Pagado" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Detalles del Servicio
          </DialogTitle>
          <DialogDescription>Solicitud #{request.requestId}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Client Info */}
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={request.contractorAvatarUrl || "/api/placeholder/48/48"} />
              <AvatarFallback>
                {request.clientName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{request.clientName}</h3>
              <p className="text-sm text-muted-foreground">{request.serviceName}</p>
              <div className="flex gap-2 mt-2">
                <Badge className={getStatusColor(status)}>{status}</Badge>
                <Badge className={getPaymentStatusColor(paymentStatus)}>
                  Pago: {paymentStatus}
                </Badge>
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Información del Servicio
            </h4>
            <div className="space-y-3 pl-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Descripción</p>
                <p className="text-sm">{request.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Urgencia</p>
                  <Badge
                    variant={
                      request.urgency === "Alta"
                        ? "destructive"
                        : request.urgency === "Media"
                        ? "secondary"
                        : "default"
                    }
                  >
                    {request.urgency}
                  </Badge>
                </div>
                {request.additionalDetails && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Detalles adicionales</p>
                    <p className="text-sm flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {request.additionalDetails}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                <p className="text-sm flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {request.location}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Presupuesto del cliente</p>
                <p className="text-sm flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {request.budget}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Línea de Tiempo
            </h4>
            <div className="space-y-3 pl-6">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                <div>
                  <p className="text-sm font-medium">Solicitud creada</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.requestDate).toLocaleString()}
                  </p>
                </div>
              </div>

              {request.acceptedDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Solicitud aceptada</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.acceptedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {request.scheduledVisitDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Visita programada</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.scheduledVisitDate).toLocaleDateString()}
                      {request.scheduledVisitTime && ` a las ${request.scheduledVisitTime}`}
                    </p>
                  </div>
                </div>
              )}

              {request.proformaUploadedDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Cotización enviada</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.proformaUploadedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {request.completedDate && (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Servicio finalizado</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.completedDate).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {request.paidDate && (
                <div className="flex items-start gap-3">
                  <DollarSign className="w-4 h-4 text-green-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Pago registrado</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.paidDate).toLocaleString()} • {request.paymentMethod}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Visit Notes */}
          {request.visitNotes && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notas de Visita
              </h4>
              <div className="pl-6 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">{request.visitNotes}</p>
              </div>
            </div>
          )}

          {/* Documents */}
          {request.proformaDocumentUrl && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documentos
              </h4>
              <div className="pl-6 space-y-2">
                <a
                  href={request.proformaDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  Ver cotización/proforma
                </a>
                {request.paymentProofUrl && (
                  <a
                    href={request.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    Ver comprobante de pago
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Rating */}
          {request.hasRating && request.ratingStars && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4" />
                Calificación del Cliente
              </h4>
              <div className="pl-6 p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{"⭐".repeat(request.ratingStars)}</span>
                  <span className="text-sm font-medium">{request.ratingStars}/5 estrellas</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
