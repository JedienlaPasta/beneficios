import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedRoutes = ["/dashboard"];
const publicRoutes = ["/", "/login", "/register"];

// Secret key for verifying JWTs - should match the one in session.ts
const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-at-least-32-characters-long",
);

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

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

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/", request.url));
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
