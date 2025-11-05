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
import { Search, CheckCircle, MapPin } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useServiceRequest } from "@/hooks/useServiceRequest";
import type { CreateServiceRequestDto } from "@/types/service-request";
import { MapPickerModal } from "./MapPickerModal";
import { ServiceSelector } from "./ServiceSelector";
import { ContractorSelector } from "./ContractorSelector";

export const ServiceRequestForm = () => {
  const { user } = useAuth();
  const { status, progress, loading, requestService } = useServiceRequest();
  const [showMap, setShowMap] = useState(false);

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

  const [addressDetails, setAddressDetails] = useState("");

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

    // El backend espera: clientId, serviceId, description, location, urgency, additionalDetails, budget
    const payload = {
      clientId: user.userId,
      serviceId: Number(form.serviceId),
      description: form.description.trim() || "Sin descripción",
      location: form.location.trim(),
      urgency: form.urgency.toLowerCase(), // Backend espera minúsculas: "alta", "media", "baja"
      additionalDetails: addressDetails.trim() || form.estimatedDuration.trim() || "",
      budget: form.budget.trim() || "$0",
    };
    console.log("📦 Payload enviado:", payload);

    await requestService(payload as any);
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
              <ServiceSelector
                value={form.serviceId}
                onChange={(serviceId) => {
                  setForm({ ...form, serviceId });
                }}
                disabled={loading}
              />

              {/* Lista informativa de contratistas */}
              {form.serviceId > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium mb-2">
                    ℹ️ Contratistas disponibles para este servicio:
                  </p>
                  <ContractorSelector
                    serviceId={form.serviceId}
                    selectedContractorId={null}
                    onSelectContractor={() => {}}
                  />
                </div>
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

              {/* Urgencia y Presupuesto */}
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
                  <label className="text-sm font-medium">Presupuesto</label>
                  <Input
                    placeholder="Ej: $150"
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Ubicación */}
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

              {/* Detalle adicional de dirección */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Detalles adicionales de dirección</label>
                <Input
                  placeholder="Ej: Apartamento 3B, Piso 2, Torre Norte, etc."
                  value={addressDetails}
                  onChange={(e) => setAddressDetails(e.target.value)}
                />
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
