import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Obtener la cookie de la sesión del usuario
  const userSessionCookie = request.cookies.get("userSession")?.value;

  // Si no hay sesión, redirigir al inicio
  if (!userSessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let userSession;
  try {
    // Intentar parsear la cookie
    userSession = JSON.parse(userSessionCookie);
  } catch (error) {
    console.error("Error al parsear la sesión del usuario:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }

  const path = request.nextUrl.pathname;

  // Verificar acceso a cualquier ruta bajo /dashboard
  if (path.startsWith("/dashboard")) {
    // Si no hay sesión activa, redirigir al inicio
    if (!userSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Verificar acceso a la ruta /dashboard/registros (solo administradores)
    if (path.startsWith("/dashboard/registros")) {
      if (userSession.rol !== "Administrador") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
    // Para cualquier otra ruta bajo /dashboard (rsh, beneficios, entregas, etc.), solo verificar que haya sesión
    else if (!userSession) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Accesos a cualquier subruta bajo /dashboard
  ],
};
