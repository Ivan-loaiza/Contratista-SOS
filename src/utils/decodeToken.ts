import { jwtDecode } from "jwt-decode";

export type Role = "client" | "contractor";

export interface DecodedSession {
  userId: number;
  fullName: string;
  email: string;
  roles: string[];
  role: Role;
}

function pickRoleFromAny(raw: any): Role {
  const val = Array.isArray(raw) ? raw[0] : raw;
  const t = (val ?? "").toString().toLowerCase();
  return t === "contractor" || t === "contratista" ? "contractor" : "client";
}

/**
 * Decodifica un JWT y genera una sesión estandarizada
 */
export function decodeToken(jwt: string, extra?: Partial<DecodedSession>): DecodedSession {
  const decoded = jwtDecode<any>(jwt);

  const tokenRoleRaw =
    decoded.role ??
    decoded.roles ??
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  const extraRoleRaw = extra?.role ?? extra?.roles ?? undefined;

  const rolesArray: string[] = Array.isArray(extra?.roles)
    ? extra!.roles!
    : (Array.isArray(decoded.roles) ? decoded.roles : []).map((r: any) => String(r));

  const role: Role = extraRoleRaw
    ? pickRoleFromAny(extraRoleRaw)
    : pickRoleFromAny(tokenRoleRaw);

  return {
    userId: Number(decoded.userId ?? decoded.sub ?? 0),
    fullName: extra?.fullName ?? decoded.fullName ?? decoded.name ?? "",
    email: extra?.email ?? decoded.email ?? "",
    roles: rolesArray,
    role,
  };
}
