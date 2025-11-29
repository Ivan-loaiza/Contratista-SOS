// src/components/client/ServiceRequestDetailModal.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CalendarDays,
  MapPin,
  DollarSign,
  Clock,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { ServiceRequestHistory } from "@/types/service-request";
import { openPDFInNewTab } from "@/utils/pdfUtils";
import { cancelServiceRequest } from "@/services/ServiceRequestApi";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useState } from "react";
import { ProblemPhotosViewer } from "@/components/shared/ProblemPhotosViewer";

interface ServiceRequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ServiceRequestHistory;
  onUpdate?: () => void;
}

export const ServiceRequestDetailModal = ({
  isOpen,
  onClose,
  request,
  onUpdate,
}: ServiceRequestDetailModalProps) => {
  const { user } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    return `${formatDate(date)} a las ${time}`;
  };

  const getStatusInfo = () => {
    const status = request.status || "Pendiente";

    switch (status) {
      case "Cancelada":
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          text: "Solicitud Cancelada",
          color: "text-red-700",
          bgColor: "bg-red-50",
        };
      case "Finalizada":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
          text: "Servicio Finalizado",
          color: "text-green-700",
          bgColor: "bg-green-50",
        };
      case "Aceptada":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-blue-600" />,
          text: "Solicitud Aceptada",
          color: "text-blue-700",
          bgColor: "bg-blue-50",
        };
      case "Pendiente":
      default:
        return {
          icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
          text: "En Espera de Contratista",
          color: "text-yellow-700",
          bgColor: "bg-yellow-50",
        };
    }
  };

  const statusInfo = getStatusInfo();

  const handleViewProforma = () => {
    if (request.proformaDocumentUrl) {
      openPDFInNewTab(request.proformaDocumentUrl);
    }
  };

  const handleCancelRequest = async () => {
    if (!user?.userId) return;

    if (!confirm("¿Estás seguro de que deseas cancelar esta solicitud?")) {
      return;
    }

    try {
      setCancelling(true);
      await cancelServiceRequest(request.requestId, user.userId);
      toast.success("Solicitud cancelada exitosamente");
      onUpdate?.();
      onClose();
    } catch (err: any) {
      console.error("Error al cancelar solicitud:", err);
      toast.error(err.response?.data?.message || "No se pudo cancelar la solicitud");
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = () => {
    // Debug: ver los valores
    console.log("canCancel check:", {
      isActive: request.isActive,
      status: request.status,
      paymentStatus: request.paymentStatus,
    });

    // Permitir cancelar si está activa, en estado Pendiente o Aceptada, y no está pagada
    const isPendingOrAccepted = request.status === "Pendiente" || request.status === "Aceptada";
    const isNotPaid = !request.paymentStatus || request.paymentStatus !== "Pagado";

    return request.isActive && isPendingOrAccepted && isNotPaid;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles de la Solicitud</DialogTitle>
          <DialogDescription>
            Información completa del servicio solicitado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado actual */}
          <div className={`flex items-center gap-3 p-4 rounded-lg ${statusInfo.bgColor}`}>
            {statusInfo.icon}
            <div>
              <p className={`font-semibold ${statusInfo.color}`}>
                {statusInfo.text}
              </p>
              {request.acceptedDate && (
                <p className="text-xs text-gray-600">
                  Aceptada el {formatDate(request.acceptedDate)}
                </p>
              )}
            </div>
          </div>

          {/* Información del servicio */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Servicio Solicitado</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge className="bg-blue-600">{request.serviceName}</Badge>
                <Badge
                  variant="outline"
                  className={`${
                    request.urgency === "Alta"
                      ? "border-red-300 text-red-600"
                      : request.urgency === "Media"
                      ? "border-yellow-300 text-yellow-600"
                      : "border-green-300 text-green-600"
                  }`}
                >
                  {request.urgency}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{request.description}</p>
            </div>
          </div>

          {/* Información del contratista */}
          {request.contractorId && request.contractorName && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Contratista Asignado</h3>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={request.contractorAvatarUrl || undefined} />
                  <AvatarFallback>
                    {request.contractorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{request.contractorName}</p>
                  <p className="text-xs text-gray-600">Contratista profesional</p>
                </div>
              </div>
            </div>
          )}

          {/* Detalles de la visita */}
          {request.scheduledVisitDate && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Visita Programada</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <span>{formatDateTime(request.scheduledVisitDate, request.scheduledVisitTime || "Por definir")}</span>
                </div>
                {request.visitNotes && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-md">
                    <p className="text-xs font-medium text-blue-900 mb-1">Notas de la visita:</p>
                    <p className="text-sm text-gray-700">{request.visitNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Fotos del Problema */}
          <ProblemPhotosViewer requestId={request.requestId} />

          {/* Detalles del servicio */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Detalles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="font-medium">{request.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Presupuesto</p>
                  <p className="font-medium">{request.budget}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Duración estimada</p>
                  <p className="font-medium">{request.estimatedDuration}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-xs text-gray-500">Fecha de solicitud</p>
                  <p className="font-medium">{formatDate(request.requestDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Documento de proforma */}
          {request.proformaDocumentUrl && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Documentos</h3>
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-10 h-10 text-blue-600" />
                  <div>
                    <p className="font-medium">Proforma de Cotización</p>
                    <p className="text-xs text-gray-500">
                      Subida el {request.proformaUploadedDate ? formatDate(request.proformaUploadedDate) : "N/A"}
                    </p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={handleViewProforma}>
                  <Download className="w-4 h-4 mr-1" />
                  Ver PDF
                </Button>
              </div>
            </div>
          )}

          {/* Información de pago */}
          {request.status === "Finalizada" && (
            <div>
              <h3 className="font-semibold text-lg mb-3">Estado de Pago</h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge
                    variant={request.paymentStatus === "Pagado" ? "default" : "secondary"}
                    className={request.paymentStatus === "Pagado" ? "bg-green-600" : ""}
                  >
                    {request.paymentStatus}
                  </Badge>
                </div>

                {request.paymentStatus === "Pagado" && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Método:</span>
                      <span className="text-sm font-medium">{request.paymentMethod}</span>
                    </div>
                    {request.paidDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fecha de pago:</span>
                        <span className="text-sm font-medium">{formatDate(request.paidDate)}</span>
                      </div>
                    )}
                    {request.paymentProofUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-2"
                        onClick={() => openPDFInNewTab(request.paymentProofUrl!)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Ver comprobante de pago
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Timeline visual */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Línea de Tiempo</h3>
            <div className="space-y-3">
              {/* Solicitud creada */}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                <div>
                  <p className="text-sm font-medium">Solicitud creada</p>
                  <p className="text-xs text-gray-500">{formatDate(request.requestDate)}</p>
                </div>
              </div>

              {/* Aceptada */}
              {request.acceptedDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Aceptada por {request.contractorName}</p>
                    <p className="text-xs text-gray-500">{formatDate(request.acceptedDate)}</p>
                  </div>
                </div>
              )}

              {/* Finalizada */}
              {request.completedDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Servicio finalizado</p>
                    <p className="text-xs text-gray-500">{formatDate(request.completedDate)}</p>
                  </div>
                </div>
              )}

              {/* Pagada */}
              {request.paidDate && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                  <div>
                    <p className="text-sm font-medium">Pago registrado</p>
                    <p className="text-xs text-gray-500">{formatDate(request.paidDate)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <div>
            {canCancel() && (
              <Button
                variant="destructive"
                onClick={handleCancelRequest}
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <XCircle className="w-4 h-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancelar Solicitud
                  </>
                )}
              </Button>
            )}
          </div>
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
