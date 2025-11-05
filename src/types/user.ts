export interface UserRole {
  id: number;
  roleId: number;
  roleName: string; // por ejemplo: "Cliente", "Contratista", "Administrador"
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  avatarUrl?: string | null;
  googleId?: string | null;
  createdAt?: string;
  userRoles: UserRole[];
}
