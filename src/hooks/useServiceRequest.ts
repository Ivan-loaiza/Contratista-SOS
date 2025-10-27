import { useState } from "react";
import Swal from "sweetalert2";
import { createServiceRequest } from "@/services/ServiceRequestApi";
import type { CreateServiceRequestDto } from "@/types/service-request";

export function useServiceRequest() {
  const [status, setStatus] = useState<"idle" | "searching" | "found" | "in-progress">("idle");
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const requestService = async (payload: CreateServiceRequestDto) => {
    try {
      setLoading(true);
      await createServiceRequest(payload);
      setStatus("searching");
      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        setProgress(current);
        if (current >= 100) {
          clearInterval(interval);
          setStatus("found");
        }
      }, 200);
    } catch (e) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo crear la solicitud" });
    } finally {
      setLoading(false);
    }
  };

  return { status, progress, loading, requestService, setStatus };
}
