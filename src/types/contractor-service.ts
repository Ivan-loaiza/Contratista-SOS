// src/types/contractor-service.ts
import type { Service } from "./service";

export interface ContractorRole {
  name: string;
}

export interface ContractorUser {
  userId: number;
  fullName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  userRoles?: ContractorRole[] | null;
}

export interface ContractorServiceDto {
  contractorId: number;
  contractor: ContractorUser;
  serviceId: number;
  service?: Service | null;
}
