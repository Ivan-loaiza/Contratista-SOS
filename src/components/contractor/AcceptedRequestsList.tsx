// src/components/contractor/AcceptedRequestsList.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  Eye,
  AlertCircle,
} from "lucide-react";
import type { ContractorServiceRequest } from "@/services/ServiceRequestApi";

// Tipo extendido con el status inferido
type RequestWithStatus = ContractorServiceRequest & {
  status: string;
};

interface AcceptedRequestsListProps {
  requests: ContractorServiceRequest[];
  onScheduleVisit: (request: RequestWithStatus) => void;
  onSendQuotation: (request: RequestWithStatus) => void;
  onMarkCompleted: (requestId: number) => Promise<void>;
  onViewDetails: (request: RequestWithStatus) => void;
}

export function AcceptedRequestsList({
  requests,
  onScheduleVisit,
  onSendQuotation,
  onMarkCompleted,
  onViewDetails,
}: AcceptedRequestsListProps) {
  const [processing, setProcessing] = useState<Record<number, boolean>>({});

  // Función para inferir el status basado en los campos disponibles
  const inferStatus = (request: ContractorServiceRequest): string => {
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

  // Agregar el status inferido a las solicitudes
  const requestsWithStatus: RequestWithStatus[] = requests.map((request) => ({
    ...request,
    status: inferStatus(request),
  }));

  const handleMarkCompleted = async (requestId: number) => {
    try {
      setProcessing((prev) => ({ ...prev, [requestId]: true }));
      await onMarkCompleted(requestId);
    } catch (error) {
      console.error("Error marking as completed:", error);
    } finally {
      setProcessing((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusBadge = (request: RequestWithStatus) => {
    if (request.status === "Finalizada") {
      if (request.paymentStatus === "Pagado") {
        return <Badge className="bg-green-600">Pagado</Badge>;
      }
      return <Badge className="bg-blue-600">Finalizada - Pendiente de Pago</Badge>;
    }
    if (request.proformaDocumentUrl) {
      return <Badge className="bg-purple-600">Cotización Enviada</Badge>;
    }
    if (request.scheduledVisitDate) {
      return <Badge className="bg-yellow-600">Visita Programada</Badge>;
    }
    return <Badge className="bg-orange-600">Aceptada</Badge>;
  };

  const getActionButtons = (request: RequestWithStatus) => {
    // Si ya está finalizada y pagada, solo mostrar detalles
    if (request.status === "Finalizada" && request.paymentStatus === "Pagado") {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onViewDetails(request)} className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalles
          </Button>
          {request.paymentProofUrl && (
            <Button
              variant="outline"
              onClick={() => window.open(request.paymentProofUrl!, "_blank")}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Ver Comprobante
            </Button>
          )}
        </div>
      );
    }

    // Si está finalizada pero no pagada, solo ver detalles
    if (request.status === "Finalizada") {
      return (
        <Button variant="outline" onClick={() => onViewDetails(request)} className="w-full">
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalles
        </Button>
      );
    }

    // Si tiene cotización enviada, puede marcar como finalizada
    if (request.proformaDocumentUrl) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onViewDetails(request)} className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalles
          </Button>
          <Button
            onClick={() => handleMarkCompleted(request.requestId)}
            disabled={processing[request.requestId]}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {processing[request.requestId] ? "Procesando..." : "Marcar Finalizada"}
          </Button>
        </div>
      );
    }

    // Si tiene visita programada, puede enviar cotización
    if (request.scheduledVisitDate) {
      return (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onViewDetails(request)} className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Ver Detalles
          </Button>
          <Button
            onClick={() => onSendQuotation(request)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            Enviar Cotización
          </Button>
        </div>
      );
    }

    // Si recién se aceptó, programar visita
    return (
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => onViewDetails(request)} className="flex-1">
          <Eye className="w-4 h-4 mr-2" />
          Ver Detalles
        </Button>
        <Button
          onClick={() => onScheduleVisit(request)}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Programar Visita
        </Button>
      </div>
    );
  };

  if (requestsWithStatus.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No tienes solicitudes aceptadas</p>
          <p className="text-sm text-muted-foreground mt-2">
            Las solicitudes que aceptes aparecerán aquí
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requestsWithStatus.map((request) => (
        <Card key={request.requestId} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={request.contractorAvatarUrl || "/api/placeholder/40/40"} />
                  <AvatarFallback>
                    {request.clientName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{request.clientName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {request.serviceName} • Solicitud #{request.requestId}
                  </p>
                </div>
              </div>
              {getStatusBadge(request)}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Descripción</h4>
                  <p className="text-sm text-muted-foreground">{request.description}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{request.location}</span>
                  </div>
                  {request.additionalDetails && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span>{request.additionalDetails}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{request.budget}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="capitalize">Urgencia: {request.urgency}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <h5 className="font-medium">Estado del Servicio</h5>
                {request.acceptedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aceptada:</span>
                    <span className="font-medium">
                      {new Date(request.acceptedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {request.scheduledVisitDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visita programada:</span>
                    <span className="font-medium">
                      {new Date(request.scheduledVisitDate).toLocaleDateString()}
                      {request.scheduledVisitTime && ` ${request.scheduledVisitTime}`}
                    </span>
                  </div>
                )}
                {request.proformaDocumentUrl && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cotización:</span>
                    <span className="font-medium text-green-600">Enviada</span>
                  </div>
                )}
                {request.completedDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finalizada:</span>
                    <span className="font-medium">
                      {new Date(request.completedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-muted-foreground">Pago:</span>
                  <span
                    className={`font-medium ${
                      request.paymentStatus === "Pagado" ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {request.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {request.visitNotes && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-sm mb-1">Notas de Visita</h5>
                <p className="text-sm text-muted-foreground">{request.visitNotes}</p>
              </div>
            )}

            {getActionButtons(request)}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
