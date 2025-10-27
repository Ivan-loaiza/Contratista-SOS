export interface CreateServiceRequestDto {
  clientId: number;
  serviceId: number;
  contractorId: number | null;
  description: string;
  location: string;
  urgency: "Alta" | "Media" | "Baja";
  estimatedDuration: string;
  budget: string;
  requestDate: string;
  serviceDate: string | null;
  isActive: boolean;
}
