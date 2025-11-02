import { useState } from "react";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useServiceRequest } from "@/hooks/useServiceRequest";
import { useContractors } from "@/hooks/useContractors";
import type { CreateServiceRequestDto } from "@/types/service-request";
import { MapPickerModal } from "./MapPickerModal";

export const ServiceRequestForm = () => {
  const { user } = useAuth();
  const { status, progress, loading, requestService } = useServiceRequest();
  const [showMap, setShowMap] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<number | null>(null); // ✅ Nuevo estado

  const [form, setForm] = useState<
    Omit<
      CreateServiceRequestDto,
      "clientId" | "contractorId" | "requestDate" | "serviceDate" | "isActive"
    >
  >({
    serviceId: 0,
    description: "",
    location: "",
    urgency: "Media",
    estimatedDuration: "",
    budget: "",
  });

  // ✅ Cargar contratistas según el tipo de servicio
  const { contractors, loading: loadingContractors, error } = useContractors(form.serviceId);

  // 🧠 Envío al backend
  const handleSubmit = async () => {
    if (!user?.userId) {
      Swal.fire("No autenticado", "Debes iniciar sesión para solicitar un servicio.", "warning");
      return;
    }

    if (!form.serviceId || !form.location.trim()) {
      Swal.fire("Campos incompletos", "Selecciona un servicio y una ubicación.", "info");
      return;
    }

    if (!selectedContractor) {
      Swal.fire("Sin contratista", "Selecciona un contratista antes de enviar.", "info");
      return;
    }

    const payload: CreateServiceRequestDto = {
      clientId: user.userId,
      contractorId: selectedContractor, // ✅ ahora sí selecciona uno
      serviceId: Number(form.serviceId),
      description: form.description,
      location: form.location,
      urgency: form.urgency,
      estimatedDuration: form.estimatedDuration,
      budget: form.budget,
      requestDate: new Date().toISOString(),
      serviceDate: null,
      isActive: true,
    };
    console.log("📦 Payload enviado:", payload);

    await requestService(payload);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            Solicitar Servicio
          </CardTitle>
          <CardDescription>
            Describe tu proyecto y selecciona tu ubicación en el mapa
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === "idle" && (
            <>
              {/* Tipo de servicio */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Servicio</label>
                <select
                  className="w-full p-3 border rounded-lg"
                  value={form.serviceId}
                  onChange={(e) => {
                    setForm({ ...form, serviceId: Number(e.target.value) });
                    setSelectedContractor(null); // ✅ limpiar contratista seleccionado
                  }}
                >
                  <option value={0}>Seleccione un servicio...</option>
                  <option value={1}>Fontanería</option>
                  <option value={2}>Electricidad</option>
                  <option value={3}>Pintura</option>
                  <option value={4}>Construcción</option>
                  <option value={5}>Reparaciones</option>
                </select>
              </div>

              {/* 👷 Lista de contratistas */}
              {loadingContractors && (
                <div className="flex items-center gap-2 text-blue-600 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cargando contratistas disponibles...</span>
                </div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}

              {!loadingContractors && contractors.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-600 mb-2">
                    Contratistas disponibles:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {contractors.map((c) => (
                      <Card
                        key={c.userId}
                        onClick={() => setSelectedContractor(c.userId)} // ✅ seleccionar
                        className={`cursor-pointer border-2 transition ${
                          selectedContractor === c.userId
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <CardContent className="p-3 flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={c.avatarUrl || undefined} />
                            <AvatarFallback>
                              {c.fullName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-sm">{c.fullName}</h4>
                            <p className="text-xs text-gray-500">{c.email || "Sin correo"}</p>
                          </div>

                          <Badge variant="secondary">Disponible</Badge>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {!loadingContractors &&
                form.serviceId > 0 &&
                contractors.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    No hay contratistas disponibles para este servicio.
                  </p>
                )}

              {/* Descripción */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción del Proyecto</label>
                <textarea
                  className="w-full p-3 border rounded-lg h-24 resize-none"
                  placeholder="Describe detalladamente lo que necesitas..."
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              {/* Urgencia y duración */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Urgencia</label>
                  <select
                    className="w-full p-3 border rounded-lg"
                    value={form.urgency}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        urgency: e.target.value as "Alta" | "Media" | "Baja",
                      })
                    }
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Duración estimada</label>
                  <Input
                    placeholder="Ej: 2 horas"
                    value={form.estimatedDuration}
                    onChange={(e) =>
                      setForm({ ...form, estimatedDuration: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Presupuesto y ubicación */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Presupuesto</label>
                  <Input
                    placeholder="Ej: $150"
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Ubicación</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Selecciona en el mapa..."
                      className="flex-1"
                      value={form.location}
                      onChange={(e) =>
                        setForm({ ...form, location: e.target.value })
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowMap(true)}
                    >
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* ✅ Botón corregido */}
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" /> Solicitar Servicio
                  </>
                )}
              </Button>
            </>
          )}

          {status === "searching" && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-blue-600 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Buscando contratistas...
              </h3>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground mt-2">
                {progress}% completado
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {showMap && (
        <MapPickerModal
          onClose={() => setShowMap(false)}
          onSelect={(address) => setForm({ ...form, location: address })}
        />
      )}
    </>
  );
};
