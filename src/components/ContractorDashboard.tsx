// src/components/ContractorDashboard.tsx
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Textarea } from "./ui/textarea";
import {
  Bell, Star, Clock, DollarSign, FileText, Send, Plus, LogOut, Wrench, MapPin, User,
  CheckCircle, XCircle, Calculator, Receipt, FileCheck,
} from "lucide-react";
import { acceptServiceRequest, getServiceRequests } from "@/services/ServiceRequestApi";
import { listMyDocuments, createDocument } from "@/services/DocumentApi";
import { useAuth } from "@/context/AuthContext";
import Swal from "sweetalert2";

interface ContractorDashboardProps {
  onLogout: () => void;
}

interface ServiceRequest {
  requestId: number;
  clientName: string;
  serviceName: string;
  description: string;
  location: string;
  urgency: string;
  estimatedDuration: string;
  budget: string;
  requestTime: string;
}

type DocKind = "cotizacion" | "factura" | "proforma";

interface OutDoc {
  id: number;
  kind: DocKind;
  clientName: string;
  amount: number;
  date: string;       // ISO
  status: "Pendiente" | "Pagada" | "Enviada" | "Revisión";
  pdfUrl?: string | null;
  requestId: number;
}

export function ContractorDashboard({ onLogout }: ContractorDashboardProps) {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [documentType, setDocumentType] = useState<DocKind>("cotizacion");
  const [serviceItems, setServiceItems] = useState([{ description: "", hours: "", rate: "" }]);
  const [notes, setNotes] = useState("");

  // ids en proceso de aceptar
  const [accepting, setAccepting] = useState<Record<number, boolean>>({});
  // doc context: a qué solicitud/cliente le voy a enviar el doc
  const [currentReqForDoc, setCurrentReqForDoc] = useState<ServiceRequest | null>(null);

  const [sentDocs, setSentDocs] = useState<OutDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const { user } = useAuth();

  // =========================
  // Solicitudes + documentos
  // =========================
  useEffect(() => {
    let stopped = false;

    const fetchRequests = async () => {
      try {
        const data = await getServiceRequests();
        if (!stopped) setRequests(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener solicitudes:", error);
      }
    };

    const fetchDocs = async () => {
      try {
        setLoadingDocs(true);
        const data = await listMyDocuments();
        if (!stopped) setSentDocs(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error al obtener documentos:", e);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchRequests();
    fetchDocs();

    const id = window.setInterval(() => {
      fetchRequests();
      fetchDocs();
    }, 8000);

    return () => {
      stopped = true;
      window.clearInterval(id);
    };
  }, []);

  async function refreshRequests() {
    try {
      const data = await getServiceRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error refrescando solicitudes:", e);
    }
  }

  async function refreshDocs() {
    try {
      setLoadingDocs(true);
      const data = await listMyDocuments();
      setSentDocs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error refrescando documentos:", e);
    } finally {
      setLoadingDocs(false);
    }
  }

  // =========================
  // Helpers Documentos
  // =========================
  const total = useMemo(() => {
    return serviceItems.reduce((acc, it) => {
      const h = parseFloat(it.hours || "0") || 0;
      const r = parseFloat(it.rate || "0") || 0;
      return acc + h * r;
    }, 0);
  }, [serviceItems]);

  const addServiceItem = () =>
    setServiceItems((prev) => [...prev, { description: "", hours: "", rate: "" }]);

  const removeServiceItem = (index: number) =>
    setServiceItems((prev) => prev.filter((_, i) => i !== index));

  const updateServiceItem = (index: number, field: "description" | "hours" | "rate", value: string) =>
    setServiceItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));

  // =========================
  // Aceptar solicitud
  // =========================
  async function handleAccept(req: ServiceRequest) {
    if (!user?.userId) {
      await Swal.fire({
        icon: "warning",
        title: "Sesión requerida",
        text: "Debes iniciar sesión como contratista.",
      });
      return;
    }

    const contractorName =
      (user as any)?.fullName ??
      (user as any)?.name ??
      (user as any)?.displayName ??
      (user as any)?.email ??
      "Contratista";

    try {
      setAccepting((s) => ({ ...s, [req.requestId]: true }));

      await acceptServiceRequest(req.requestId, {
        contractorId: user.userId,
        contractorName,
      });

      // Prefill del formulario de documento
      setCurrentReqForDoc(req);
      setDocumentType("cotizacion");
      setActiveTab("documents");
      setNotes(`Trabajo: ${req.serviceName}. Ubicación: ${req.location}.`);
      // Atajo: si el cliente dio presupuesto, colócalo como referencia
      if (req.budget && !isNaN(parseFloat(req.budget.replace(/[^0-9.]/g, "")))) {
        // deja los items tal cual; el total se calcula con horas*tarifa
      }

      await Swal.fire({
        icon: "success",
        title: "Solicitud aceptada",
        html: `
          <div style="text-align:left">
            <p><b>Cliente:</b> ${req.clientName}</p>
            <p><b>Servicio:</b> ${req.serviceName}</p>
            <p>Ahora puedes crear y enviar una <b>cotización</b>.</p>
          </div>
        `,
        confirmButtonText: "Crear cotización",
      });
    } catch (err: any) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      console.error("Aceptar falló:", { status, data, raw: err });
      await Swal.fire({
        icon: "error",
        title: "No se pudo aceptar la solicitud",
        text: data?.message ?? "Intenta de nuevo.",
      });
    } finally {
      setAccepting((s) => ({ ...s, [req.requestId]: false }));
      refreshRequests().catch(() => {});
    }
  }

  // =========================
  // Enviar documento
  // =========================
  async function handleSendDocument() {
    if (!currentReqForDoc) {
      await Swal.fire({
        icon: "info",
        title: "Selecciona una solicitud",
        text: "Acepta una solicitud primero para asociar el documento.",
      });
      return;
    }

    const items = serviceItems
      .map((it) => ({
        description: it.description.trim(),
        hours: parseFloat(it.hours || "0") || 0,
        rate: parseFloat(it.rate || "0") || 0,
      }))
      .filter((x) => x.description && x.hours > 0 && x.rate > 0);

    if (items.length === 0) {
      await Swal.fire({
        icon: "info",
        title: "Agrega al menos un ítem",
        text: "Cada ítem debe tener descripción, horas y tarifa válidas.",
      });
      return;
    }

    try {
      await createDocument({
  kind: documentType,
  requestId: currentReqForDoc.requestId,
  items,
  notes: notes.trim() || undefined,
  total,
}, user!.userId // ✅ Forzar a TypeScript a saber que no es null
); // <-- ¡pasas el contractorId!


      await Swal.fire({
        icon: "success",
        title: `${documentType[0].toUpperCase() + documentType.slice(1)} enviada`,
        text: `El cliente ${currentReqForDoc.clientName} recibirá el documento.`,
      });

      // limpiar y refrescar
      setServiceItems([{ description: "", hours: "", rate: "" }]);
      setNotes("");
      await refreshDocs();
    } catch (err: any) {
      console.error("createDocument error:", err?.response?.data ?? err);
      await Swal.fire({
        icon: "error",
        title: "No se pudo enviar el documento",
        text: err?.response?.data?.message ?? "Inténtalo nuevamente.",
      });
    }
  }



    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Panel Contratista</h1>
              <p className="text-sm text-muted-foreground">SOS Service-on demand</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-fit mb-6">
            <TabsTrigger value="requests" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Solicitudes
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Mi Panel
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          {/* Service Requests Tab */}
          <TabsContent value="requests">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-600" />
                    Solicitudes Pendientes
                  </CardTitle>
                  <CardDescription>
                    Revisa y responde a las solicitudes de servicio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.length === 0 && (
                      <div className="text-sm text-muted-foreground">
                        No hay solicitudes por el momento.
                      </div>
                    )}

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
                                <p className="text-sm text-muted-foreground">
                                  {request.requestTime}
                                </p>
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
                              <p className="text-sm text-muted-foreground mb-3">
                                {request.description}
                              </p>

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

                          <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                              <XCircle className="w-4 h-4 mr-2" />
                              Declinar
                            </Button>

                            <Button
                              onClick={() => handleAccept(request)}
                              className="w-full"
                              disabled={!!accepting[request.requestId]}
                            >
                              {accepting[request.requestId] ? "Aceptando..." : "Aceptar Solicitud"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Crear documento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Crear Documento
                  </CardTitle>
                  <CardDescription>
                    {currentReqForDoc
                      ? <>Para: <b>{currentReqForDoc.clientName}</b> • Solicitud #{currentReqForDoc.requestId}</>
                      : "Acepta una solicitud para asociar el documento al cliente"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tipo de Documento</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={documentType === "cotizacion" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDocumentType("cotizacion")}
                        className={documentType === "cotizacion" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <Calculator className="w-4 h-4 mr-1" />
                        Cotización
                      </Button>
                      <Button
                        variant={documentType === "factura" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDocumentType("factura")}
                        className={documentType === "factura" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <Receipt className="w-4 h-4 mr-1" />
                        Factura
                      </Button>
                      <Button
                        variant={documentType === "proforma" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setDocumentType("proforma")}
                        className={documentType === "proforma" ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        <FileCheck className="w-4 h-4 mr-1" />
                        Proforma
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project">Descripción del Proyecto</Label>
                    <Textarea id="project" placeholder="Describe el trabajo..." className="h-20" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Servicios y Mano de Obra</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addServiceItem}>
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar Item
                      </Button>
                    </div>

                    {serviceItems.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium">Item {index + 1}</h5>
                          {serviceItems.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeServiceItem(index)}>
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Input
                            placeholder="Descripción del servicio"
                            value={item.description}
                            onChange={(e) => updateServiceItem(index, "description", e.target.value)}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Horas"
                              type="number"
                              value={item.hours}
                              onChange={(e) => updateServiceItem(index, "hours", e.target.value)}
                            />
                            <Input
                              placeholder="Tarifa/hora ($)"
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateServiceItem(index, "rate", e.target.value)}
                            />
                          </div>

                          {item.hours && item.rate && (
                            <div className="text-right text-sm font-medium">
                              Subtotal: {(parseFloat(item.hours) * parseFloat(item.rate)).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total:</span>
                        <span className="text-xl font-bold text-green-600">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      placeholder="Términos y condiciones, garantías, etc."
                      className="h-16"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleSendDocument}
                    disabled={!currentReqForDoc || total <= 0}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Enviar {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
                  </Button>
                </CardContent>
              </Card>

              {/* Historial documentos enviados */}
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Enviados</CardTitle>
                  <CardDescription>Historial de cotizaciones, facturas y proformas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loadingDocs && (
                      <div className="text-sm text-muted-foreground">Cargando documentos…</div>
                    )}

                    {!loadingDocs && sentDocs.length === 0 && (
                      <div className="text-sm text-muted-foreground">Aún no has enviado documentos.</div>
                    )}

                    {!loadingDocs &&
                      sentDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {doc.kind === "cotizacion"
                                  ? "Cotización"
                                  : doc.kind === "factura"
                                  ? "Factura"
                                  : "Proforma"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Cliente: {doc.clientName} • {new Date(doc.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              ${doc.amount.toFixed(2)}
                            </div>
                            <Badge
                              variant={doc.status === "Pagada" ? "default" : doc.status === "Pendiente" ? "secondary" : "outline"}
                              className={
                                doc.status === "Pagada"
                                  ? "bg-green-100 text-green-700"
                                  : doc.status === "Pendiente"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700"
                              }
                            >
                              {doc.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas del Mes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">18</div>
                      <div className="text-sm text-muted-foreground">Trabajos Completados</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">$2,450</div>
                      <div className="text-sm text-muted-foreground">Ingresos del Mes</div>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">4.8</div>
                      <div className="text-sm text-muted-foreground">Calificación Promedio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trabajos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Reparación fontanería</div>
                          <div className="text-xs text-muted-foreground">Ana Martínez</div>
                        </div>
                        <div className="text-sm font-medium">$280</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Próximas Citas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2].map((item) => (
                      <div key={item} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Instalación eléctrica</div>
                          <div className="text-xs text-muted-foreground">Mañana 10:00 AM</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Mi Perfil Profesional</CardTitle>
                <CardDescription>Administra tu información y especialidades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input id="name" defaultValue="Carlos Rodríguez" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input id="phone" defaultValue="+1234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="carlos@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Años de Experiencia</Label>
                    <Input id="experience" type="number" defaultValue="8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Especialidades</Label>
                  <Input id="specialties" defaultValue="Fontanería, Electricidad, Reparaciones" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Descripción Profesional</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Especialista en fontanería y electricidad con más de 8 años de experiencia. Trabajo rápido y eficiente, garantía en todos mis servicios."
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hourlyRate">Tarifa por Hora ($)</Label>
                  <Input id="hourlyRate" type="number" defaultValue="25" />
                </div>

                <Button className="bg-green-600 hover:bg-green-700">Guardar Cambios</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
