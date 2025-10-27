import { useState, useEffect } from "react";
import { decodeToken, type DecodedSession } from "@/utils/decodeToken";

export function useAuthSession() {
  const [user, setUser] = useState<DecodedSession | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const loadSession = (jwt: string, extra?: Partial<DecodedSession>) => {
    const session = decodeToken(jwt, extra);
    setUser(session);
    setToken(jwt);
    localStorage.setItem("token", jwt);
    localStorage.setItem("user", JSON.stringify(session));
  };

  const restoreSession = () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (!storedToken) return;
    try {
      setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
      else loadSession(storedToken);
    } catch {
      clearSession();
    }
  };

  const clearSession = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return { user, token, loadSession, clearSession };
}
