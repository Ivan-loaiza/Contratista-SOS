// src/api/contractorApplicationsApi.ts
import http from './http';
import type {
  ContractorApplicationCreateDto,
  ContractorApplicationResponse
} from '@/types/contractor';

// POST /ContractorApplications
export const createContractorApplication = async (data: ContractorApplicationCreateDto) => {
  const res = await http.post<ContractorApplicationResponse>('/ContractorApplications', data);
  return res.data;
};

// GET /ContractorApplications/{id}
export const getContractorApplication = async (id: number) => {
  const res = await http.get<ContractorApplicationResponse>(`/ContractorApplications/${id}`);
  return res.data;
};
