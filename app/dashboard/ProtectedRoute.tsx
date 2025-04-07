"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // Los roles permitidos para esta ruta (opcional)
  isDashboardRoute: boolean; // Si es una ruta dentro de /dashboard
}

export default function ProtectedRoute({
  children,
  allowedRoles = [], // Si no se pasa `allowedRoles`, se establece como un array vacío
  isDashboardRoute,
}: ProtectedRouteProps) {
  const router = useRouter();

  interface UserSession {
    nombre: string;
    cargo: string;
    rol: string;
    correo: string;
  }

  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Obtener la sesión desde localStorage
    const storedSession = localStorage.getItem("userSession");

    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession);
        setUserSession(parsedSession);
      } catch (error) {
        console.error("Error al parsear userSession:", error);
        localStorage.removeItem("userSession"); // Eliminar sesión corrupta
      }
    }

    // Use a shorter timeout for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    // Clean up timeout to prevent memory leaks
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Si no hay sesión activa, redirigir al inicio
      if (!userSession) {
        router.replace("/"); // Redirigir si no hay sesión
        return;
      }

      if (isDashboardRoute) {
        // Check for specific route restrictions
        const pathname = window.location.pathname;

        // Si es una ruta de /dashboard, validamos el rol de administrador para /dashboard/registros
        if (
          pathname === "/dashboard/registros" &&
          userSession.rol !== "Administrador"
        ) {
          router.replace("/dashboard"); // Redirect to dashboard instead of home
          return;
        }

        // Si hay roles permitidos, validamos que el usuario tenga uno de los roles permitidos
        if (
          allowedRoles.length > 0 &&
          !allowedRoles.includes(userSession.rol)
        ) {
          router.replace("/dashboard"); // Redirect to dashboard instead of home
        }
      }
    }
  }, [isLoading, userSession, allowedRoles, router, isDashboardRoute]);

  return <>{children}</>;
}
