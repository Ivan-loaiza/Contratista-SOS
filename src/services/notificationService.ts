// src/services/notificationService.ts
import { API } from "./ServiceRequestApi";

export interface Notification {
  notificationId: number;
  userId: number;
  requestId: number;
  message: string;
  type: string; // "accepted", "completed", "cancelled", etc.
  isRead: boolean;
  createdAt: string;
  serviceName?: string;
  contractorName?: string;
}

/**
 * Obtener todas las notificaciones del cliente
 */
export async function getClientNotifications(clientId: number): Promise<Notification[]> {
  const res = await API.get(`/Notification/client/${clientId}`);
  return res.data;
}

/**
 * Marcar una notificación como leída
 */
export async function markNotificationAsRead(notificationId: number): Promise<void> {
  await API.put(`/Notification/${notificationId}/mark-read`);
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllNotificationsAsRead(clientId: number): Promise<void> {
  await API.put(`/Notification/client/${clientId}/mark-all-read`);
}

/**
 * Obtener el conteo de notificaciones no leídas
 */
export async function getUnreadNotificationsCount(clientId: number): Promise<number> {
  const res = await API.get(`/Notification/client/${clientId}/unread-count`);
  return res.data.count || 0;
}
