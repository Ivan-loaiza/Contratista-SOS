// src/components/contractor/PendingRequestsList.tsx
import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MapPin, Clock, DollarSign, XCircle, Eye } from "lucide-react";
import Swal from "sweetalert2";

export interface PendingRequest {
  requestId: number;
  clientName: string;
  serviceName: string;
  description: string;
  location: string;
  urgency: "Alta" | "Media" | "Baja";
  estimatedDuration: string;
  budget: string;
  requestTime: string;
}

interface PendingRequestsListProps {
  requests: PendingRequest[];
  onViewDetails: (request: PendingRequest) => void;
  onDecline?: (requestId: number) => Promise<void>;
}

export function PendingRequestsList({ requests, onViewDetails, onDecline }: PendingRequestsListProps) {
  const [processing, setProcessing] = useState<Record<number, boolean>>({});

  const handleDecline = async (requestId: number) => {
    if (!onDecline) return;

    const result = await Swal.fire({
      title: "¿Declinar solicitud?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, declinar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        setProcessing((prev) => ({ ...prev, [requestId]: true }));
        await onDecline(requestId);
        await Swal.fire("Declinada", "La solicitud ha sido declinada", "success");
      } catch (error) {
        console.error("Error declining request:", error);
        await Swal.fire("Error", "No se pudo declinar la solicitud", "error");
      } finally {
        setProcessing((prev) => ({ ...prev, [requestId]: false }));
      }
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay solicitudes pendientes en este momento</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.requestId} className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/api/placeholder/40/40" />
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
                  <h3 className="font-semibold">{request.clientName}</h3>
                  <p className="text-sm text-muted-foreground">{request.requestTime}</p>
                </div>
              </div>
              <Badge
                variant={
                  request.urgency === "Alta"
                    ? "destructive"
                    : request.urgency === "Media"
                    ? "secondary"
                    : "default"
                }
              >
                Urgencia {request.urgency}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium mb-2">{request.serviceName}</h4>
                <p className="text-sm text-muted-foreground mb-3">{request.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{request.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{request.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{request.budget}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium mb-2">Detalles de la Solicitud</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Servicio:</span>
                    <span className="font-medium">{request.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{request.clientName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Urgencia:</span>
                    <span className="font-medium">{request.urgency}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {onDecline && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDecline(request.requestId)}
                  disabled={processing[request.requestId]}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Declinar
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => onViewDetails(request)}
                className="flex-1"
                disabled={processing[request.requestId]}
              >
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalles y Aceptar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
