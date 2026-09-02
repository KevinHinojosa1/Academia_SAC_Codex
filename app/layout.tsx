import type { Metadata } from "next";
import "./globals.css";
import "./enhancements.css";
export const metadata: Metadata = {
  title: "Academia SAC | Recepción Segura",
  description:
    "Academia del Área de SAC para asesores y optómetras de Óptica Los Andes.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
