// src/components/contractor/ContractorDashboard.tsx
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Bell, Briefcase, User } from "lucide-react";
import { ContractorHeader } from "./ContractorHeader";
import { PendingRequestsList } from "./PendingRequestsList";
import type { PendingRequest } from "./PendingRequestsList";
import { AcceptedRequestsList } from "./AcceptedRequestsList";
import { VisitSchedulerModal } from "./VisitSchedulerModal";
import { QuotationFormModal } from "./QuotationFormModal";
import { ServiceDetailModal } from "./ServiceDetailModal";
import { AcceptRequestModal } from "./AcceptRequestModal";
import type { ServiceRequestHistory } from "@/types/service-request";
import { useAuth } from "@/context/AuthContext";
import {
  getServiceRequests,
  acceptServiceRequest,
  markServiceRequestCompleted,
  scheduleVisit,
  getContractorRequests,
  type ContractorServiceRequest,
} from "@/services/ServiceRequestApi";
import { createDocument } from "@/services/DocumentApi";
import { toast } from "sonner";
import Swal from "sweetalert2";

interface ContractorDashboardProps {
  onLogout: () => void;
}

export function ContractorDashboard({ onLogout }: ContractorDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");

  // Data states
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<ContractorServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [selectedRequestToAccept, setSelectedRequestToAccept] =
    useState<PendingRequest | null>(null);
  const [selectedRequestForVisit, setSelectedRequestForVisit] =
    useState<ContractorServiceRequest | null>(null);
  const [selectedRequestForQuotation, setSelectedRequestForQuotation] =
    useState<ContractorServiceRequest | null>(null);
  const [selectedRequestForDetail, setSelectedRequestForDetail] =
    useState<ContractorServiceRequest | null>(null);

  // Fetch data - Solo carga inicial, sin polling automático
  useEffect(() => {
    fetchAllRequests(true);
  }, [user?.userId]);

  const fetchAllRequests = async (showLoading = false) => {
    if (!user?.userId) {
      return;
    }

    try {
      if (showLoading) {
        setLoading(true);
      }

      // Hacer ambas llamadas en paralelo
      const [allRequests, myAcceptedRequests] = await Promise.all([
        getServiceRequests(),
        getContractorRequests(user.userId),
      ]);

      // Separar solicitudes pendientes (sin contratista asignado)
      const pending = allRequests
        .filter((req: any) => !req.contractorId)
        .map((req: any) => ({
          requestId: req.requestId,
          clientName: req.clientName,
          serviceName: req.serviceName,
          description: req.description,
          location: req.location,
          urgency: req.urgency,
          estimatedDuration: req.estimatedDuration,
          budget: req.budget,
          requestTime: req.requestTime || req.requestDate,
        }));

      setPendingRequests(pending);
      setAcceptedRequests(myAcceptedRequests);
    } catch (error: any) {
      console.error("Error fetching requests:", error);
      if (showLoading) {
        toast.error("Error al cargar solicitudes");
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // Handler: Aceptar solicitud con programación de visita
  const handleAcceptRequestWithVisit = async (data: {
    contractorId: number;
    contractorName: string;
    scheduledVisitDate: string;
    scheduledVisitTime: string;
    visitNotes: string;
  }) => {
    if (!selectedRequestToAccept) return;

    try {
      await acceptServiceRequest(selectedRequestToAccept.requestId, data);

      await Swal.fire({
        icon: "success",
        title: "Solicitud aceptada",
        html: `
          <div style="text-align:left">
            <p><b>Cliente:</b> ${selectedRequestToAccept.clientName}</p>
            <p><b>Servicio:</b> ${selectedRequestToAccept.serviceName}</p>
            <p><b>Visita programada:</b> ${new Date(data.scheduledVisitDate).toLocaleDateString()} a las ${data.scheduledVisitTime}</p>
            <p class="mt-2">El cliente ha sido notificado.</p>
          </div>
        `,
        confirmButtonText: "Ver Mis Solicitudes",
      });

      // Refrescar datos y cambiar a tab de aceptadas
      await fetchAllRequests(false);
      setActiveTab("accepted");
    } catch (error: any) {
      console.error("Error accepting request:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "No se pudo aceptar la solicitud",
      });
      throw error;
    }
  };

  // Handler: Programar visita
  const handleScheduleVisit = async (data: {
    requestId: number;
    visitDate: string;
    visitTime: string;
    notes: string;
  }) => {
    if (!user?.userId) return;

    try {
      await scheduleVisit(data.requestId, {
        contractorId: user.userId,
        visitDate: data.visitDate,
        visitTime: data.visitTime,
        notes: data.notes,
      });

      toast.success("Visita programada exitosamente");
      await fetchAllRequests(false);
    } catch (error: any) {
      console.error("Error scheduling visit:", error);
      toast.error(error?.response?.data?.message || "No se pudo programar la visita");
      throw error;
    }
  };

  // Handler: Enviar cotización
  const handleSendQuotation = async (data: {
    requestId: number;
    kind: "cotizacion" | "factura" | "proforma";
    items: Array<{ description: string; hours: number; rate: number }>;
    notes: string;
    total: number;
  }) => {
    if (!user?.userId) return;

    try {
      await createDocument(
        {
          kind: data.kind,
          requestId: data.requestId,
          items: data.items,
          notes: data.notes,
          total: data.total,
        },
        user.userId
      );

      toast.success("Documento enviado exitosamente");
      await fetchAllRequests(false);
    } catch (error: any) {
      console.error("Error sending document:", error);
      throw error;
    }
  };

  // Handler: Marcar como finalizada
  const handleMarkCompleted = async (requestId: number) => {
    if (!user?.userId) return;

    const result = await Swal.fire({
      title: "¿Marcar como finalizada?",
      text: "Confirma que el servicio ha sido completado",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#16a34a",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, finalizar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await markServiceRequestCompleted(requestId, user.userId);
        await Swal.fire({
          icon: "success",
          title: "Servicio finalizado",
          text: "El cliente ha sido notificado y puede proceder con el pago",
        });
        await fetchAllRequests(false);
      } catch (error: any) {
        console.error("Error marking as completed:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "No se pudo marcar como finalizada",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ContractorHeader
        contractorName={(user as any)?.fullName || (user as any)?.email}
        onLogout={onLogout}
        notificationCount={pendingRequests.length}
      />

      <div className="max-w-7xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-fit mb-6">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Solicitudes Pendientes
              {pendingRequests.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Mis Solicitudes
              {acceptedRequests.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                  {acceptedRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Mi Perfil
            </TabsTrigger>
          </TabsList>

          {/* Tab: Solicitudes Pendientes */}
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-green-600" />
                  Solicitudes Disponibles
                </CardTitle>
                <CardDescription>
                  Revisa y acepta las solicitudes de servicio disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
                {!loading && (
                  <PendingRequestsList
                    requests={pendingRequests}
                    onViewDetails={(request) => setSelectedRequestToAccept(request)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Solicitudes Aceptadas */}
          <TabsContent value="accepted">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Mis Solicitudes
                </CardTitle>
                <CardDescription>
                  Gestiona tus solicitudes aceptadas, programa visitas y envía cotizaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-sm text-muted-foreground">Cargando...</p>}
                {!loading && (
                  <AcceptedRequestsList
                    requests={acceptedRequests}
                    onScheduleVisit={(request) => setSelectedRequestForVisit(request)}
                    onSendQuotation={(request) => setSelectedRequestForQuotation(request)}
                    onMarkCompleted={handleMarkCompleted}
                    onViewDetails={(request) => setSelectedRequestForDetail(request)}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Perfil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil Profesional</CardTitle>
                <CardDescription>
                  Visualiza tu información de contratista
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">
                      {(user as any)?.fullName || (user as any)?.email || "Contratista"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">ID de Usuario</p>
                    <p className="font-medium">{user?.userId}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      La edición del perfil estará disponible próximamente
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AcceptRequestModal
        isOpen={!!selectedRequestToAccept}
        onClose={() => setSelectedRequestToAccept(null)}
        request={selectedRequestToAccept}
        contractorId={user?.userId || 0}
        contractorName={
          (user as any)?.fullName ||
          (user as any)?.name ||
          (user as any)?.email ||
          "Contratista"
        }
        onAccept={handleAcceptRequestWithVisit}
      />

      <VisitSchedulerModal
        isOpen={!!selectedRequestForVisit}
        onClose={() => setSelectedRequestForVisit(null)}
        request={selectedRequestForVisit}
        onSchedule={handleScheduleVisit}
      />

      <QuotationFormModal
        isOpen={!!selectedRequestForQuotation}
        onClose={() => setSelectedRequestForQuotation(null)}
        request={selectedRequestForQuotation}
        onSubmit={handleSendQuotation}
      />

      <ServiceDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
      />
    </div>
  );
}
