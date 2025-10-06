// src/api/authApi.ts
import http from './http';

export type UserRole = 'client' | 'contractor';

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole; // opcional (si el backend lo ignora, no pasa nada)
}

export interface LoginDto {
  email: string;
  password: string;
  // role?: UserRole; // Descomenta si tu backend lo exige en /User/login
}

export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  roles?: string[]; // puede venir ausente o como string en algunos backends
}

/* Helpers */
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const normalizeRoles = (roles: unknown): string[] => {
  if (Array.isArray(roles)) return roles;
  if (typeof roles === 'string') return [roles];
  return [];
};

/* Endpoints */

// Si tu backend de /User/register devuelve VOID, cambia el retorno a: Promise<void>
export const registerUser = async (data: RegisterDto): Promise<AuthResponse> => {
  const payload = { ...data, email: normalizeEmail(data.email) };
  const res = await http.post<AuthResponse>('/User/register', payload);
  // Si tu backend no devuelve AuthResponse aquí, retorna void en vez de AuthResponse
  return res.data;
};

export const loginUser = async (data: LoginDto): Promise<AuthResponse> => {
  const payload = {
    email: normalizeEmail(data.email),
    password: data.password,
    // role: data.role, // Descomenta si el backend lo pide
  };

  const res = await http.post<AuthResponse>('/User/login', payload);
  const out = res.data ?? ({} as Partial<AuthResponse>);

  // Devolvemos el objeto normalizado (roles siempre array)
  return {
    token: out.token ?? '',
    fullName: out.fullName ?? '',
    email: out.email ?? payload.email,
    roles: normalizeRoles(out.roles),
  };
};

// Alias (por si ya los usas en otros lados)
export const register = registerUser;
export const login = loginUser;

/* Extra opcional: perfil del usuario
export const getProfile = () => http.get('/User/me').then(r => r.data);
*/

/*
NOTAS:
- Rutas respetan la mayúscula exacta de tu Swagger: /User/login y /User/register.
- http.ts ya añade /api al baseURL y evita enviar Authorization en login/register.
- Si /User/register NO devuelve token, cambia el tipo de registerUser a Promise<void>
  y adapta el flujo del frontend (login después del registro, como ya haces).
*/
