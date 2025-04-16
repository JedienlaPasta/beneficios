import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./ui/fonts";

export const metadata: Metadata = {
  title: {
    template: "%s | SIBAS - El Quisco ",
    default: "SIBAS - Municipalidad El Quisco",
  },
  description: "Sistema Integrado de Beneficios y Asistencias Sociales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-200/80 antialiased`}>
        {children}
      </body>
    </html>
  );
}
