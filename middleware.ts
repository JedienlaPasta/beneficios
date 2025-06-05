import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/", "/login", "/register"];

const roleRestrictedRoutes = {
  "/dashboard/usuarios": ["administrador"],
  "/dashboard/auditoria": ["administrador"],
};

// Secret key for verifying JWTs - should match the one in session.ts
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-at-least-32-characters-long",
);

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Log the path to see what's being intercepted
  console.log("Middleware path:", path);

  // --- IMPORTANT: Ensure static files and internal Next.js paths are NOT processed by middleware logic ---
  // This is generally handled by the matcher, but a defensive check here can be useful if the matcher is complex.
  // However, for this specific issue, the matcher improvement is the main focus.
  // If you were to add a defensive check, it would look something like:
  if (
    path.startsWith("/_next/static/") ||
    path.startsWith("/_next/image/") ||
    path.startsWith("/favicon.ico") ||
    path.startsWith("/elquisco.svg") // Example for a specific public asset
  ) {
    return NextResponse.next();
  }
  // --- IMPORTANT: Ensure static files and internal Next.js paths are NOT processed by middleware logic ---

  const isProtectedRoute = protectedRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
  const isPublicRoute = publicRoutes.some((route) => path === route);

  // Get the session cookie directly from the request
  const sessionCookie = request.cookies.get("session")?.value;

  let session = null;
  if (sessionCookie && sessionCookie.trim() !== "") {
    try {
      const verified = await jwtVerify(sessionCookie, secretKey);
      session = verified.payload;
    } catch (error: any) {
      // Type assertion with 'any' to access error.message
      // Invalid or expired token - don't log in production
      console.error("Invalid session token:", error?.message || String(error));

      // If on a protected route with an invalid token, redirect to login
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  // Verificar autenticación básica
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Verificar restricciones de rol
  if (session?.userId) {
    // Comprobar si la ruta actual requiere un rol específico
    for (const [routePath, allowedRoles] of Object.entries(
      roleRestrictedRoutes,
    )) {
      if (path === routePath || path.startsWith(`${routePath}/`)) {
        // Get the userRole cookie instead of using the JWT
        const userRoleCookie = request.cookies.get("userRole")?.value;

        if (!userRoleCookie) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        try {
          const userData = JSON.parse(decodeURIComponent(userRoleCookie));
          const userRole = userData.rol?.toLowerCase();

          if (!userRole || !allowedRoles.includes(userRole)) {
            // Redirigir a dashboard si no tiene permisos
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        } catch (error) {
          console.error("Error parsing userRole cookie:", error);
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        break;
      }
    }
  }

  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Add a config to specify which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any files in the /public directory (explicitly exclude based on common patterns)
     * Note: Next.js generally handles /public itself, but explicit exclusion in matcher
     * can prevent unexpected middleware interception.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ],
};
