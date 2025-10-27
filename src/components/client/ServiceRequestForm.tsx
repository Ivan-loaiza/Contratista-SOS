import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useServiceRequest } from "@/hooks/useServiceRequest";
import { useAuth } from "@/context/AuthContext";

export const ServiceRequestForm = () => {
  const { user } = useAuth();
  const { status, progress, loading, requestService, setStatus } = useServiceRequest();

  const [form, setForm] = useState({
    serviceId: 1,
    description: "",
    location: "",
    urgency: "Alta" as "Alta" | "Media" | "Baja",
    estimatedDuration: "2 horas",
    budget: "$150",
  });

  const handleSubmit = async () => {
    if (!user?.userId) return;
    await requestService({
      clientId: user.userId,
      contractorId: null,
      requestDate: new Date().toISOString(),
      serviceDate: null,
      isActive: true,
      ...form,
    });
  };

  return (
    <div className="p-4 border rounded-lg bg-white space-y-4">
      <h3 className="text-lg font-semibold">Solicitar Servicio</h3>
      <Input
        placeholder="Descripción del servicio"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <Input
        placeholder="Ubicación"
        value={form.location}
        onChange={(e) => setForm({ ...form, location: e.target.value })}
      />
      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Buscando..." : "Enviar solicitud"}
      </Button>
      {status === "searching" && <p>Buscando contratistas... {progress}%</p>}
      {status === "found" && (
        <p className="text-green-600">
          Contratista encontrado.
          <Button onClick={() => setStatus("idle")} variant="outline" className="ml-2">
            Buscar otro
          </Button>
        </p>
      )}
    </div>
  );
};
