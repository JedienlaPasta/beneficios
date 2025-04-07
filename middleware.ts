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

    // Verificar que la sesión tenga la estructura esperada
    if (!userSession || typeof userSession !== "object" || !userSession.rol) {
      throw new Error("Sesión inválida");
    }
  } catch (error) {
    console.error("Error al parsear la sesión del usuario:", error);
    // Limpiar la cookie inválida
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete("userSession");
    return response;
  }

  const path = request.nextUrl.pathname;

  // Verificar acceso a cualquier ruta bajo /dashboard
  if (path.startsWith("/dashboard")) {
    // Verificar acceso a rutas específicas según el rol
    if (
      path.startsWith("/dashboard/registros") &&
      userSession.rol !== "Administrador"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Aquí puedes agregar más verificaciones de permisos para otras rutas
    // if (path.startsWith("/dashboard/otra-ruta-protegida") && !tienePermiso(userSession)) {
    //   return NextResponse.redirect(new URL("/dashboard", request.url));
    // }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Accesos a cualquier subruta bajo /dashboard
  ],
};
