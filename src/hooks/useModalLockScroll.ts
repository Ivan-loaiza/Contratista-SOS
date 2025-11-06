// src/hooks/useModalLockScroll.ts
import { useEffect } from "react";

/**
 * Hook para bloquear el scroll del body cuando un modal está abierto
 * y prevenir interacciones con elementos del fondo
 */
export function useModalLockScroll(isOpen: boolean) {
  useEffect(() => {
    if (isOpen) {
      // Guardar el scroll actual
      const scrollY = window.scrollY;

      // Bloquear scroll del body
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Cleanup: restaurar scroll
      return () => {
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);
}
