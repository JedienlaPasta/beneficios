import type { Metadata } from "next";
import "./globals.css";
import { inter } from "./ui/fonts";

export const metadata: Metadata = {
  title: {
    template: "%s | Social El Quisco",
    default: "Social El Quisco",
  },
  description:
    "Gestor de la entrega y registro de los beneficios sociales destinados a los habitantes de El Quisco",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
