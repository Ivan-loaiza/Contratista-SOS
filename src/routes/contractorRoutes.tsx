// src/routes/contractorRoutes.tsx
import { Navigate } from "react-router-dom";
import { ContractorDashboard } from "@/components/contractor/ContractorDashboard";
import { Login } from "@/pages/Login";
import type { RouteObject } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Rutas específicas para el rol de Contratista
 * Protegidas según autenticación
 */
export function getContractorRoutes(): RouteObject[] {
  const { isAuthenticated, hasRole } = useAuth();
  const isContractor = hasRole("contractor");

  // Si no está autenticado o no es contratista → redirige a login
  if (!isAuthenticated || !isContractor) {
    return [
      { path: "/login", element: <Login /> },
      { path: "*", element: <Navigate to="/login" replace /> },
    ];
  }

  // Si está autenticado y es contratista
  return [
    { path: "/", element: <Navigate to="/dashboard" replace /> },
    { path: "/dashboard", element: <ContractorDashboard onLogout={function (): void {
        throw new Error("Function not implemented.");
    } } /> },
  ];
}
