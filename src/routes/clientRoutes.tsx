//import { RouteObject } from "react-router-dom";
import ClientDashboard from "@/components/client/ClientDashboard";
import { Login } from "@/pages/Login";
//import LoginPage from "@/pages/LoginPage";
import type { RouteObject } from "react-router-dom";

export const clientRoutes: RouteObject[] = [
  { path: "/login", element: <Login /> },
  { path: "/dashboard", element: <ClientDashboard /> },
];
