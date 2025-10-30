export type UrgencyLevel = "Alta" | "Media" | "Baja";

export interface CreateServiceRequestDto {
  clientId: number;              // Id del cliente
  serviceId: number;             // Id del servicio
  contractorId: number | null;   // Id del contratista (puede ser null)
  description: string;           // Descripción del trabajo
  location: string;              // Dirección o zona
  urgency: UrgencyLevel;         // Nivel de urgencia ("Alta", "Media", "Baja")
  estimatedDuration: string;     // Ejemplo: "2 horas"
  budget: string;                // Ejemplo: "$150"
  requestDate: string;           // Fecha ISO (se envía como string)
  serviceDate: string | null;    // Fecha opcional (puede ser null)
  isActive: boolean;             // Activo / inactivo
}
