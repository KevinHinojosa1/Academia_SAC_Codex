import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), usb=()",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    // vinext applies the Server Actions limit to every POST request. Evidence
    // uploads are still capped and validated again inside /api/receptions.
    serverActions: {
      bodySizeLimit: "24mb",
    },
  },
  async headers() {
    return [
      { source: "/", headers: securityHeaders },
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
