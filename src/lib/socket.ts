// src/lib/socket.ts
import * as signalR from "@microsoft/signalr";

export function createSocket() {
  const base = import.meta.env.VITE_API_BASE_URL ?? "https://localhost:7095";
  return new signalR.HubConnectionBuilder()
    .withUrl(`${base}/hubs/notifications`, {
      accessTokenFactory: () => localStorage.getItem("token") ?? "",
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .build();
}
