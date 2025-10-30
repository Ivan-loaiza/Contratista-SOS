// src/routes/index.tsx
import { useRoutes } from "react-router-dom";
import { getClientRoutes } from "./clientRoutes";
import { useAuth } from "@/context/AuthContext";
import { WelcomeScreen } from "@/components/WelcomeScreen";

export function AppRoutes() {
  const { hasRole } = useAuth();

  const isClient = hasRole("client");

  const publicRoutes = [
    { path: "/", element: <WelcomeScreen initialTab="login" /> },
    { path: "/login", element: <WelcomeScreen initialTab="login" /> },
    { path: "/register", element: <WelcomeScreen initialTab="register" /> },
  ];

  const protectedRoutes = isClient ? getClientRoutes() : [];

  const routes = [...publicRoutes, ...protectedRoutes];
  return useRoutes(routes);
}
