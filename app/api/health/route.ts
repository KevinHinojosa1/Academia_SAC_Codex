export function GET() {
  return Response.json(
    {
      status: "ok",
      uptime: typeof process !== "undefined" && typeof process.uptime === "function" ? process.uptime() : 0,
      timestamp: new Date().toISOString(),
      service: "SAC te dice",
    },
    {
      headers: {
        "cache-control": "no-store, max-age=0",
      },
    },
  );
}
