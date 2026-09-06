import { and, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db";
import { collaborators, sessions } from "@/db/schema";
import { randomToken, sha256, verifyPin } from "@/lib/server/crypto";
import {
  ApiError,
  assertSameOrigin,
  errorResponse,
  noStoreHeaders,
} from "@/lib/server/errors";
import {
  SESSION_LIFETIME_SECONDS,
  expiredSessionCookie,
  getAuthenticatedUser,
  sessionCookie,
  sessionTokenHash,
} from "@/lib/server/session";

const loginSchema = z
  .object({
    employeeCode: z
      .string()
      .trim()
      .min(4)
      .max(20)
      .regex(/^[A-Za-z0-9-]+$/),
    pin: z.string().regex(/^\d{4}$/),
  })
  .strict();

const DUMMY_PIN_HASH =
  "pbkdf2_sha256$210000$0xJmpVFSTsi2-GTJbCaPiA$LUBrBdQcrk7tbINnJu8hkRenvXOCRzvm5V1q_p8eT_g";
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_SECONDS = 15 * 60;

function publicUser(user: {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string | null;
  role: "asesor" | "optometra" | "admin";
  store: string;
}) {
  return user;
}

export async function GET(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    return Response.json(
      { authenticated: Boolean(user), user: user ? publicUser(user) : null },
      { headers: noStoreHeaders() },
    );
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > 2_048) {
      throw new ApiError(413, "PAYLOAD_TOO_LARGE", "La solicitud es demasiado grande.");
    }
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      throw new ApiError(400, "INVALID_CREDENTIALS", "Código o PIN inválido.");
    }

    const employeeCode = parsed.data.employeeCode.toUpperCase();
    const now = Math.floor(Date.now() / 1000);
    const db = getDb();
    const [account] = await db
      .select()
      .from(collaborators)
      .where(eq(collaborators.employeeCode, employeeCode))
      .limit(1);

    if (!account) {
      await verifyPin(parsed.data.pin, DUMMY_PIN_HASH);
      throw new ApiError(401, "INVALID_CREDENTIALS", "Código o PIN inválido.");
    }
    if (!account.active) {
      await verifyPin(parsed.data.pin, account.pinHash);
      throw new ApiError(401, "INVALID_CREDENTIALS", "Código o PIN inválido.");
    }
    if (account.lockedUntil && account.lockedUntil > now) {
      throw new ApiError(
        429,
        "ACCOUNT_LOCKED",
        "La cuenta está temporalmente bloqueada. Intente nuevamente más tarde.",
      );
    }

    const valid = await verifyPin(parsed.data.pin, account.pinHash);
    if (!valid) {
      const previousFailures = account.lockedUntil ? 0 : account.failedLoginAttempts;
      const nextFailures = previousFailures + 1;
      await db
        .update(collaborators)
        .set({
          failedLoginAttempts: nextFailures >= MAX_FAILED_ATTEMPTS ? 0 : nextFailures,
          lockedUntil: nextFailures >= MAX_FAILED_ATTEMPTS ? now + LOCK_SECONDS : null,
          updatedAt: now,
        })
        .where(eq(collaborators.id, account.id));
      throw new ApiError(401, "INVALID_CREDENTIALS", "Código o PIN inválido.");
    }

    const token = randomToken();
    const tokenHash = await sha256(token);
    const expiresAt = now + SESSION_LIFETIME_SECONDS;
    await db.delete(sessions).where(lt(sessions.expiresAt, now));
    await db.insert(sessions).values({
      tokenHash,
      collaboratorId: account.id,
      expiresAt,
      createdAt: now,
      lastSeenAt: now,
    });
    await db
      .update(collaborators)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: now,
        updatedAt: now,
      })
      .where(eq(collaborators.id, account.id));

    const headers = new Headers(noStoreHeaders());
    headers.append("set-cookie", sessionCookie(token, request.url));
    return Response.json(
      {
        authenticated: true,
        expiresAt,
        user: publicUser({
          id: account.id,
          employeeCode: account.employeeCode,
          fullName: account.fullName,
          email: account.email,
          role: account.role,
          store: account.store,
        }),
      },
      { headers },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return errorResponse(
        new ApiError(400, "INVALID_JSON", "El cuerpo JSON no es válido."),
      );
    }
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertSameOrigin(request);
    const tokenHash = await sessionTokenHash(request);
    if (tokenHash) {
      const db = getDb();
      await db
        .delete(sessions)
        .where(and(eq(sessions.tokenHash, tokenHash), lt(sessions.expiresAt, Number.MAX_SAFE_INTEGER)));
    }
    const headers = new Headers(noStoreHeaders());
    headers.append("set-cookie", expiredSessionCookie(request.url));
    return Response.json({ authenticated: false }, { headers });
  } catch (error) {
    return errorResponse(error);
  }
}
