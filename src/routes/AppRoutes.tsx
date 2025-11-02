// src/routes/AppRoutes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { useAuth } from "@/context/AuthContext";
import { ClientDashboardProvider } from "@/context/ClientDashboardContext";
import ClientDashboard from "@/components/client/ClientDashboard";
import { ContractorDashboard } from "@/components/ContractorDashboard";

export default function AppRoutes() {
  const { isAuthenticated, hasRole, user, logout } = useAuth();

  // Roles normalizados
  const isContractor = hasRole("contractor") || user?.role === "contractor";
  const isClient = hasRole("client") && !isContractor;

  return (
    <Routes>
      {/* Página inicial */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Autenticación */}
      <Route path="/login" element={<WelcomeScreen initialTab="login" />} />
      <Route path="/register" element={<WelcomeScreen initialTab="register" />} />

      {/* Dashboard de Cliente */}
      <Route
        path="/client"
        element={
          isAuthenticated && isClient ? (
            <ClientDashboardProvider>
              <ClientDashboard />
            </ClientDashboardProvider>
          ) : (
            <Navigate
              to={
                isAuthenticated
                  ? isContractor
                    ? "/contractor"
                    : "/login"
                  : "/login"
              }
              replace
            />
          )
        }
      />

      {/* Dashboard de Contratista */}
      <Route
        path="/contractor"
        element={
          isAuthenticated && isContractor ? (
            <ContractorDashboard onLogout={logout} />
          ) : (
            <Navigate
              to={
                isAuthenticated
                  ? isClient
                    ? "/client"
                    : "/login"
                  : "/login"
              }
              replace
            />
          )
        }
      />

      {/* Cualquier ruta no encontrada */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
