export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  const requestId = crypto.randomUUID();
  console.error(`[${requestId}] Unhandled API error`, error);
  return Response.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "No fue posible completar la operación.",
        requestId,
      },
    },
    { status: 500 },
  );
}

export function assertSameOrigin(request: Request): void {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || url.host;
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const expectedOrigin = `${proto}://${host}`;

  try {
    const originUrl = new URL(origin);
    if (
      origin === expectedOrigin ||
      origin === url.origin ||
      originUrl.host === host ||
      originUrl.hostname === url.hostname ||
      originUrl.hostname.endsWith(".onrender.com") ||
      originUrl.hostname === "localhost" ||
      originUrl.hostname === "127.0.0.1"
    ) {
      return;
    }
  } catch {
    // Malformed URL, fall through
  }

  throw new ApiError(403, "INVALID_ORIGIN", "Origen de solicitud no permitido.");
}

export function noStoreHeaders(): HeadersInit {
  return { "cache-control": "no-store, private" };
}
