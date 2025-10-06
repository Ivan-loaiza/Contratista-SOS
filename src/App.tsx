// src/App.tsx
import React, { Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AppRoutes from "./routes";

/* ============ Loader global muy simple ============ */
function GlobalLoader() {
  return (
    <div className="min-h-screen grid place-items-center">
      <div className="flex items-center gap-2 text-muted-foreground">
        <span className="h-3 w-3 rounded-full animate-pulse bg-primary" />
        <span className="h-3 w-3 rounded-full animate-pulse bg-primary/70" />
        <span className="h-3 w-3 rounded-full animate-pulse bg-primary/50" />
        <span className="ml-2">Cargando…</span>
      </div>
    </div>
  );
}

/* ============ ErrorBoundary sin dependencias ============ */
type ErrorBoundaryProps = { children: React.ReactNode; fallback?: React.ReactNode };
type ErrorBoundaryState = { hasError: boolean; error?: any };

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    if (import.meta.env.DEV) {
      console.error("[ErrorBoundary]", error, info);
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="min-h-screen grid place-items-center p-6">
            <div className="max-w-md w-full border rounded-xl p-6 bg-background">
              <h1 className="text-xl font-semibold mb-2">Algo salió mal</h1>
              <p className="text-sm text-muted-foreground mb-4">
                Ha ocurrido un error al renderizar la interfaz.
              </p>
              <pre className="text-xs whitespace-pre-wrap opacity-75">
                {String(this.state.error ?? "")}
              </pre>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

/* ============ Restablecer scroll al cambiar de ruta ============ */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    const id = setTimeout(
      () => window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }),
      0
    );
    return () => clearTimeout(id);
  }, [pathname]);
  return null;
}

/* ============ Layout base (header/footer opcional) ============ */
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <SiteHeader /> */}
      <main className="min-h-[80vh]">{children}</main>
      {/* <SiteFooter /> */}
    </div>
  );
}

export default function App() {
  return (
    <AppShell>
      <ScrollToTop />
      <ErrorBoundary>
        <Suspense fallback={<GlobalLoader />}>
          <AppRoutes />
        </Suspense>
      </ErrorBoundary>
    </AppShell>
  );
}
