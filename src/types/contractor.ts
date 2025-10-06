export interface ContractorApplicationCreateDto {
  fullName: string;
  email: string;
  phone: string;
  serviceId: number;
  experienceYears: number;
  availability: string;       // "Tiempo completo" | "Medio tiempo" | "Por horas"
  preferredLocation?: string;
  description: string;        // usa "Especialidades" del form o resumen
}

export interface ContractorApplicationResponse {
  contractorApplicationId: number; // si tu API devuelve { contractorApplicationId, status } o { id, status }
  status: string;                  // "Pending" normalmente
}
