// src/hooks/useSocketNotifications.ts
import { useEffect, useState, useRef } from "react";
import { createSocket } from "@/lib/socket";
import Swal from "sweetalert2";

export function useSocketNotifications(userId?: number) {
  const [notice, setNotice] = useState<string | null>(null);
  const [acceptedBy, setAcceptedBy] = useState<string | null>(null);
  const socketRef = useRef<ReturnType<typeof createSocket> | null>(null);

  useEffect(() => {
    if (!userId) return;

    let isMounted = true;

    if (!socketRef.current) {
      const conn = createSocket();
      socketRef.current = conn;

      // 🎯 Evento del backend cuando un contratista acepta
      conn.on("service-request:accepted", async (msg: { contractorName: string }) => {
        if (!isMounted) return;
        setAcceptedBy(msg.contractorName);
        setNotice("Tu solicitud fue aceptada por un contratista");

        await Swal.fire({
          icon: "success",
          title: "¡Tu solicitud fue aceptada!",
          text: `El contratista ${msg.contractorName} se pondrá en contacto contigo.`,
        });
      });

      // ⚙️ Arrancar la conexión y unirse al room del usuario
      (async () => {
        try {
          await conn.start();
          await conn.invoke("JoinUserRoom", userId);
          console.log("[SignalR] conectado y unido al room del usuario:", userId);
        } catch (err) {
          console.error("[SignalR] Error al iniciar conexión:", err);
        }
      })();
    }

    // ✅ Cleanup sin promesa
    return () => {
      isMounted = false;
      socketRef.current?.stop().catch(() => {});
      socketRef.current = null;
    };
  }, [userId]);

  return {
    notice,
    acceptedBy,
    dismissNotice: () => setNotice(null),
  };
}
