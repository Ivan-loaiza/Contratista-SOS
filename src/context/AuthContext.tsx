import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { type DecodedSession, type Role } from "@/utils/decodeToken";

interface AuthContextType {
  user: DecodedSession | null;
  token: string | null;
  login: (jwt: string, extra?: Partial<DecodedSession>) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (r: Role) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, loadSession, clearSession } = useAuthSession();

  const hasRole = (r: Role) => {
    if (!user) return false;
    return (
      user.role === r ||
      user.roles?.some((x) => (x ?? "").toString().toLowerCase().includes(r))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: loadSession,
        logout: clearSession,
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
