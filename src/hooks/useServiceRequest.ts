import { useState } from "react";
import Swal from "sweetalert2";
import { createServiceRequest } from "@/services/ServiceRequestApi";
import type { CreateServiceRequestDto } from "@/types/service-request";

export function useServiceRequest() {
  // 🔹 Estados principales del flujo
  const [status, setStatus] = useState<"idle" | "searching" | "found" | "in-progress">("idle");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [acceptedBy, setAcceptedBy] = useState<string | null>(null); // ✅ nuevo estado

  // 🔹 Enviar solicitud al backend
  const requestService = async (payload: CreateServiceRequestDto) => {
    try {
      setLoading(true);
      setStatus("searching");
      setProgress(0);

      // Llamada a la API (POST /api/ServiceRequests)
      await createServiceRequest(payload);

      // Simulación de búsqueda progresiva (efecto visual)
      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        setProgress(current);
        if (current >= 100) {
          clearInterval(interval);
          setStatus("found");

          // Simulación de contratista encontrado (mock temporal)
          setAcceptedBy("Carlos Rodríguez");

          Swal.fire({
            icon: "success",
            title: "¡Contratista encontrado!",
            text: "Se ha asignado un profesional para tu solicitud.",
            confirmButtonColor: "#2563eb",
          });
        }
      }, 250);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo crear la solicitud. Inténtalo de nuevo.",
      });
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    progress,
    loading,
    requestService,
    setStatus,
    acceptedBy, // ✅ se devuelve al componente
  };
}
