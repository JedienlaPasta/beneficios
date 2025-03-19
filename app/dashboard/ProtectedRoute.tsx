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
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
    return (
      <div className="absolute top-1/2 flex -translate-y-3/4 flex-col items-center 3xl:w-[96rem] 3xl:justify-self-center">
        <Loading />
        <p className="text-slate-600">Cargando...</p>
      </div>
    ); // Mostrar un indicador de carga mientras se obtiene la sesión
  }

  return <>{children}</>;
}

export function Loading() {
  return (
    <div className="relative my-6 h-[70px] w-[70px]">
      <div className='absolute left-[10px] top-0 block h-[10px] w-[10px] rotate-[70deg] rounded-[10px] before:absolute before:right-0 before:h-[10px] before:w-[10px] before:animate-loading before:rounded-[10px] before:bg-[#3f93e0] before:content-[""]' />
      <div className='absolute right-0 top-[10px] block h-[10px] w-[10px] rotate-[160deg] rounded-[10px] before:absolute before:right-0 before:h-[10px] before:w-[10px] before:animate-loading before:rounded-[10px] before:bg-[#1655a1] before:content-[""]' />
      <div className='absolute bottom-0 right-[10px] block h-[10px] w-[10px] rotate-[-110deg] rounded-[10px] before:absolute before:right-0 before:h-[10px] before:w-[10px] before:animate-loading before:rounded-[10px] before:bg-[#3f93e0] before:content-[""]' />
      <div className='absolute bottom-[10px] left-0 block h-[10px] w-[10px] rotate-[-20deg] rounded-[10px] before:absolute before:right-0 before:h-[10px] before:w-[10px] before:animate-loading before:rounded-[10px] before:bg-[#1655a1] before:content-[""]' />
    </div>
  );
}
