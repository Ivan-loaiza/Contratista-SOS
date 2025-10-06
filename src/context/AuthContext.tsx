// src/context/AuthContext.tsx
import {
  createContext, useContext, useState, useEffect, type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";

type Role = 'client' | 'contractor';

export interface UserSession {
  userId: number;
  fullName: string;
  email: string;
  roles: string[];          // <- guardamos array del backend
  role: Role;               // <- rol “normalizado” para UI
}

interface AuthContextType {
  user: UserSession | null;
  token: string | null;
  login: (token: string, extra?: Partial<UserSession>) => void; // <- acepta extra
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (r: Role) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

function pickRoleFromAny(raw: any): Role {
  const val = Array.isArray(raw) ? raw[0] : raw;
  const t = (val ?? '').toString().toLowerCase();
  // acepta 'contractor', 'contratista' (es/pt) y fallback a client
  return t === 'contractor' || t === 'contratista' ? 'contractor' : 'client';
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const setSessionFromToken = (jwt: string, extra?: Partial<UserSession>) => {
    const decoded = jwtDecode<any>(jwt);

    // del token
    const tokenRoleRaw =
      decoded.role ??
      decoded.roles ??
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // del extra (respuesta del backend)
    const extraRoleRaw =
      extra?.role ??
      extra?.roles ??
      undefined;

    // roles “crudos” como array para permisos finos
    const rolesArray: string[] = Array.isArray(extra?.roles)
      ? extra!.roles!
      : (Array.isArray(decoded.roles) ? decoded.roles : [])
          .map((r: any) => String(r));

    const role: Role = extraRoleRaw
      ? pickRoleFromAny(extraRoleRaw)
      : pickRoleFromAny(tokenRoleRaw);

    const currentUser: UserSession = {
      userId: Number(decoded.userId ?? decoded.sub ?? 0),
      fullName: extra?.fullName ?? decoded.fullName ?? decoded.name ?? '',
      email: extra?.email ?? decoded.email ?? '',
      roles: rolesArray,
      role,
    };

    setToken(jwt);
    setUser(currentUser);
    localStorage.setItem("token", jwt);
    // opcional: guarda snapshot del user
    localStorage.setItem("user", JSON.stringify(currentUser));
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!storedToken) return;
    try {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setSessionFromToken(storedToken);
      }
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setToken(null);
    }
  }, []);

  const login = (jwt: string, extra?: Partial<UserSession>) => {
    try {
      setSessionFromToken(jwt, extra);
    } catch (e) {
      console.error("Token inválido", e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const hasRole = (r: Role) => {
    if (!user) return false;
    // chequea role normalizado y lista cruda
    return user.role === r ||
      user.roles?.some(x => (x ?? '').toString().toLowerCase().includes(r));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return ctx;
};
