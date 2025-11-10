// src/routes/clientRoutes.tsx
import { Navigate } from "react-router-dom";
import ClientDashboard from "@/components/client/ClientDashboard";
import { Login } from "@/pages/Login";
import type { RouteObject } from "react-router-dom";
import { ClientDashboardProvider } from "@/context/ClientDashboardContext";
import { useAuth } from "@/context/AuthContext";

/**
 * Rutas específicas para el rol de Cliente
 * Protegidas según autenticación
 */
export function getClientRoutes(): RouteObject[] {
  const { isAuthenticated, hasRole } = useAuth();
  const isClient = hasRole("client");

  if (!isAuthenticated || !isClient) {
    // Redirige al login si no está autenticado o no es cliente
    return [
      { path: "/login", element: <Login /> },
      { path: "*", element: <Navigate to="/login" replace /> },
    ];
  }

  return [
    { path: "/", element: <Navigate to="/dashboard" replace /> },
    {
      path: "/dashboard",
      element: (
        <ClientDashboardProvider>
          <ClientDashboard />
        </ClientDashboardProvider>
      ),
    },
  ];
}
