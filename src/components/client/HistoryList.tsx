// src/components/client/HistoryList.tsx
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Wrench,
  Loader2,
  CalendarDays,
  MapPin,
  DollarSign,
  FileText,
  XCircle,
  CreditCard,
  Eye,
  Bell,
  //Clock as ClockIcon,
} from "lucide-react";
import { StarRating } from "./StarRating";
import { RatingModal } from "./RatingModal";
import { ServiceRequestDetailModal } from "./ServiceRequestDetailModal";
import { RegisterPaymentModal } from "./RegisterPaymentModal";
import { getServiceRequestHistory } from "@/services/ratingService";
import { cancelServiceRequest } from "@/services/ServiceRequestApi";
import { useAuth } from "@/context/AuthContext";
import type { ServiceRequestHistory } from "@/types/service-request";
import { toast } from "sonner";

export const HistoryList = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<ServiceRequestHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal de calificación
  const [ratingModalData, setRatingModalData] = useState<{
    isOpen: boolean;
    requestId: number;
    contractorId: number;
    contractorName: string;
    contractorAvatarUrl: string | null;
    serviceName: string;
    serviceDate: string;
  } | null>(null);

  // Modal de detalles
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestHistory | null>(null);

  // Modal de pago
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [requestToPay, setRequestToPay] = useState<ServiceRequestHistory | null>(null);

  useEffect(() => {
    if (user?.userId) {
      loadHistory();
    }
  }, [user?.userId]);

  const loadHistory = async () => {
    if (!user?.userId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getServiceRequestHistory(user.userId);
      setHistory(data);
    } catch (err) {
      console.error("Error al cargar historial:", err);
      setError("No se pudo cargar el historial de servicios.");
    } finally {
      setLoading(false);
    }
  };

  const openRatingModal = (service: ServiceRequestHistory) => {
    if (!service.contractorId || !service.contractorName) {
      return;
    }

    setRatingModalData({
      isOpen: true,
      requestId: service.requestId,
      contractorId: service.contractorId,
      contractorName: service.contractorName,
      contractorAvatarUrl: service.contractorAvatarUrl,
      serviceName: service.serviceName,
      serviceDate: service.serviceDate || service.requestDate,
    });
  };

  const closeRatingModal = () => {
    setRatingModalData(null);
  };

  const handleRatingSuccess = () => {
    loadHistory();
  };

  const openDetailModal = (service: ServiceRequestHistory) => {
    setSelectedRequest(service);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedRequest(null);
  };

  const openPaymentModal = (service: ServiceRequestHistory) => {
    setRequestToPay(service);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setRequestToPay(null);
  };

  const handlePaymentSuccess = () => {
    loadHistory();
    closePaymentModal();
  };

  const handleCancelRequest = async (requestId: number) => {
    if (!user?.userId) return;

    if (!confirm("¿Estás seguro de que deseas cancelar esta solicitud?")) {
      return;
    }

    try {
      await cancelServiceRequest(requestId, user.userId);
      toast.success("Solicitud cancelada exitosamente");
      loadHistory();
    } catch (err: any) {
      console.error("Error al cancelar solicitud:", err);
      toast.error(err.response?.data?.message || "No se pudo cancelar la solicitud");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (service: ServiceRequestHistory) => {
    const status = service.status || "Pendiente";

    switch (status) {
      case "Cancelada":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Cancelada
          </Badge>
        );
      case "Finalizada":
        return service.paymentStatus === "Pagado" ? (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            Pagado
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            Finalizada
          </Badge>
        );
      case "Aceptada":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Aceptada
          </Badge>
        );
      case "Pendiente":
      default:
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            Pendiente
          </Badge>
        );
    }
  };

  const canRate = (service: ServiceRequestHistory) => {
    return (
      service.status === "Finalizada" &&
      service.paymentStatus === "Pagado" &&
      !service.hasRating
    );
  };

  const canCancel = (service: ServiceRequestHistory) => {
    return (
      service.isActive &&
      (service.status === "Pendiente" || service.status === "Aceptada") &&
      service.paymentStatus !== "Pagado"
    );
  };

  const canPay = (service: ServiceRequestHistory) => {
    return (
      service.status === "Finalizada" &&
      service.paymentStatus === "Pendiente"
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historial de Servicios</CardTitle>
          <CardDescription>
            Revisa todos los servicios que has solicitado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Estado de carga */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando historial...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="py-4">
              <p className="text-red-500 text-center">{error}</p>
              <Button onClick={loadHistory} variant="outline" className="mt-2 mx-auto block">
                Reintentar
              </Button>
            </div>
          )}

          {/* Sin servicios */}
          {!loading && !error && history.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              <Wrench className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No tienes servicios registrados aún</p>
            </div>
          )}

          {/* Lista de servicios */}
          {!loading && !error && history.length > 0 && (
            <div className="space-y-4">
              {history.map((service) => (
                <Card key={service.requestId}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Avatar del contratista o icono */}
                      {service.contractorId ? (
                        <Avatar className="w-12 h-12">
                          <AvatarImage
                            src={service.contractorAvatarUrl || undefined}
                          />
                          <AvatarFallback>
                            {service.contractorName?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-blue-600" />
                        </div>
                      )}

                      {/* Información del servicio */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold text-sm">
                              {service.serviceName}
                            </h3>
                            {service.contractorId && service.contractorName && (
                              <p className="text-xs text-gray-600">
                                Contratista: {service.contractorName}
                              </p>
                            )}
                          </div>
                          {getStatusBadge(service)}
                        </div>

                        {/* Notificación de aceptación con detalles de visita */}
                        {service.status === "Aceptada" && service.contractorName && (
                          <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Bell className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">
                                  ¡Tu solicitud fue aceptada por {service.contractorName}!
                                </p>
                                {service.scheduledVisitDate && (
                                  <div className="mt-2 space-y-1">
                                    <div className="flex items-center gap-2 text-xs text-blue-700">
                                      <CalendarDays className="w-3 h-3" />
                                      <span>
                                        <strong>Visita programada:</strong>{" "}
                                        {formatDate(service.scheduledVisitDate)}
                                        {service.scheduledVisitTime && (
                                          <> a las {service.scheduledVisitTime}</>
                                        )}
                                      </span>
                                    </div>
                                    {service.visitNotes && (
                                      <div className="flex items-start gap-2 text-xs text-blue-700 mt-2">
                                        <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        <span>
                                          <strong>Notas del contratista:</strong>{" "}
                                          {service.visitNotes}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {!service.scheduledVisitDate && (
                                  <p className="text-xs text-blue-700 mt-1">
                                    El contratista se pondrá en contacto contigo pronto para coordinar la visita.
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Descripción */}
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {service.description}
                        </p>

                        {/* Detalles */}
                        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {service.scheduledVisitDate
                              ? `Visita: ${formatDate(service.scheduledVisitDate)}`
                              : formatDate(service.requestDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {service.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {service.budget}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              service.urgency === "Alta"
                                ? "border-red-300 text-red-600"
                                : service.urgency === "Media"
                                ? "border-yellow-300 text-yellow-600"
                                : "border-green-300 text-green-600"
                            }`}
                          >
                            Urgencia: {service.urgency}
                          </Badge>
                        </div>

                        {/* Indicadores adicionales */}
                        {service.proformaDocumentUrl && (
                          <div className="flex items-center gap-1 text-xs text-blue-600 mb-2">
                            <FileText className="w-3 h-3" />
                            <span>Proforma disponible</span>
                          </div>
                        )}

                        {/* Calificación o acciones */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            {service.hasRating ? (
                              <div className="flex items-center gap-2">
                                <StarRating
                                  rating={service.ratingStars || 0}
                                  size="small"
                                  showLabel={false}
                                />
                                <span className="text-xs text-gray-500">
                                  Ya calificaste
                                </span>
                              </div>
                            ) : canRate(service) ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openRatingModal(service)}
                              >
                                Calificar servicio
                              </Button>
                            ) : null}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Botón Ver Detalles */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openDetailModal(service)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver detalles
                            </Button>

                            {/* Botón Pagar */}
                            {canPay(service) && (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openPaymentModal(service)}
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Pagar
                              </Button>
                            )}

                            {/* Botón Cancelar */}
                            {canCancel(service) && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelRequest(service.requestId)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de calificación */}
      {ratingModalData && (
        <RatingModal
          isOpen={ratingModalData.isOpen}
          onClose={closeRatingModal}
          requestId={ratingModalData.requestId}
          contractorId={ratingModalData.contractorId}
          contractorName={ratingModalData.contractorName}
          contractorAvatarUrl={ratingModalData.contractorAvatarUrl}
          serviceName={ratingModalData.serviceName}
          serviceDate={ratingModalData.serviceDate}
          onSuccess={handleRatingSuccess}
        />
      )}

      {/* Modal de detalles */}
      {selectedRequest && (
        <ServiceRequestDetailModal
          isOpen={detailModalOpen}
          onClose={closeDetailModal}
          request={selectedRequest}
          onUpdate={loadHistory}
        />
      )}

      {/* Modal de pago */}
      {requestToPay && (
        <RegisterPaymentModal
          isOpen={paymentModalOpen}
          onClose={closePaymentModal}
          request={requestToPay}
          clientId={user?.userId || 0}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
};
