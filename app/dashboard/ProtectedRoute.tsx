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
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Si no hay sesión activa, redirigir al inicio
      if (!userSession) {
        console.warn("No hay sesión activa. Redirigiendo a /");
        router.replace("/"); // Redirigir si no hay sesión
      } else if (isDashboardRoute) {
        // Si es una ruta de /dashboard, validamos el rol de administrador para /dashboard/registros
        if (
          window.location.pathname === "/dashboard/registros" &&
          userSession.rol !== "Administrador"
        ) {
          console.warn(
            "Acceso denegado a /dashboard/registros. Redirigiendo a /",
          );
          router.replace("/"); // Redirigir si no es Admin
        } else if (
          allowedRoles.length > 0 &&
          !allowedRoles.includes(userSession.rol)
        ) {
          // Si hay roles permitidos, validamos que el usuario tenga uno de los roles permitidos
          console.warn("Acceso denegado por rol. Redirigiendo a /");
          router.replace("/"); // Redirigir si el rol no tiene acceso
        }
      }
    }
  }, [isLoading, userSession, allowedRoles, router, isDashboardRoute]);

  if (isLoading) {
    return <div>Loading...</div>; // Mostrar un indicador de carga mientras se obtiene la sesión
  }

  return <>{children}</>;
}
