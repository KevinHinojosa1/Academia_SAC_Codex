import { and, eq, gt } from "drizzle-orm";
import { collaborators, sessions } from "@/db/schema";
import { getDb } from "@/db";
import { ApiError } from "./errors";
import { sha256 } from "./crypto";

export const SESSION_COOKIE = "sac_session";
export const SESSION_LIFETIME_SECONDS = 8 * 60 * 60;

export type AuthenticatedUser = {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  role: "asesor" | "optometra" | "admin";
  store: string;
};

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const pair of header.split(";")) {
    const separator = pair.indexOf("=");
    if (separator === -1) continue;
    if (pair.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(pair.slice(separator + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function sessionCookie(token: string, requestUrl: string): string {
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_LIFETIME_SECONDS}${secure}`;
}

export function expiredSessionCookie(requestUrl: string): string {
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
}

export async function sessionTokenHash(request: Request): Promise<string | null> {
  const token = parseCookie(request.headers.get("cookie"), SESSION_COOKIE);
  return token ? sha256(token) : null;
}

export async function getAuthenticatedUser(
  request: Request,
): Promise<AuthenticatedUser | null> {
  const tokenHash = await sessionTokenHash(request);
  if (!tokenHash) return null;
  const now = Math.floor(Date.now() / 1000);
  const db = getDb();
  const [row] = await db
    .select({
      id: collaborators.id,
      employeeCode: collaborators.employeeCode,
      fullName: collaborators.fullName,
      email: collaborators.email,
      role: collaborators.role,
      store: collaborators.store,
      lastSeenAt: sessions.lastSeenAt,
    })
    .from(sessions)
    .innerJoin(collaborators, eq(sessions.collaboratorId, collaborators.id))
    .where(
      and(
        eq(sessions.tokenHash, tokenHash),
        gt(sessions.expiresAt, now),
        eq(collaborators.active, true),
      ),
    )
    .limit(1);

  if (!row) return null;
  if (now - row.lastSeenAt > 300) {
    await db
      .update(sessions)
      .set({ lastSeenAt: now })
      .where(eq(sessions.tokenHash, tokenHash));
  }
  return {
    id: row.id,
    employeeCode: row.employeeCode,
    fullName: row.fullName,
    email: row.email,
    role: row.role,
    store: row.store,
  };
}

export async function requireUser(
  request: Request,
  allowedRoles?: AuthenticatedUser["role"][],
): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    throw new ApiError(401, "AUTH_REQUIRED", "Inicie sesión para continuar.");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new ApiError(403, "FORBIDDEN", "No tiene permisos para esta operación.");
  }
  return user;
}
