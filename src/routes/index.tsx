import { useRoutes } from "react-router-dom";
import { clientRoutes } from "./clientRoutes";

export function AppRoutes() {
  return useRoutes(clientRoutes);
}
