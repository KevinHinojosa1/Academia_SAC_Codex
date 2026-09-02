import type { Metadata } from "next";
import "./globals.css";
export const metadata:Metadata={title:"Academia OLA | Recepción Segura",description:"Academia interactiva para asesores y optómetras de Óptica Los Andes.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="es" suppressHydrationWarning><body>{children}</body></html>}
