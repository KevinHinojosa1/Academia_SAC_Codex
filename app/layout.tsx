import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = new URL("https://sac-recepcion-segura.choquitohino.chatgpt.site");

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: "SAC | Recepción segura",
  description:
    "Plataforma SAC para formación, práctica y trazabilidad de la recepción segura de armazones.",
  applicationName: "SAC",
  openGraph: {
    type: "website",
    url: "/",
    title: "SAC | Recepción segura",
    description:
      "Formación, práctica y trazabilidad para una recepción segura de armazones junto a SACI.",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "SAC · Recepción segura con la mascota SACI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SAC | Recepción segura",
    description:
      "Formación, práctica y trazabilidad para una recepción segura de armazones junto a SACI.",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#082e3d",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
