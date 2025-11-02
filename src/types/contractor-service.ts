// src/types/contractor-service.ts

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
  service?: {
    serviceId: number;
    name: string;
    description?: string;
  } | null;
}
