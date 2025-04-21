"use client";

import { useEffect, useState } from "react";

type RoleGuardProps = {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    // Get user role from the non-httpOnly cookie
    try {
      const cookies = document.cookie.split(";");
      const userRoleCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("userRole="),
      );

      if (!userRoleCookie) {
        setHasAccess(false);
        return;
      }

      const cookieValue = userRoleCookie.split("=")[1];
      if (!cookieValue) {
        setHasAccess(false);
        return;
      }

      const userData = JSON.parse(decodeURIComponent(cookieValue));

      if (!userData || !userData.rol) {
        setHasAccess(false);
        return;
      }

      const hasRole = allowedRoles.includes(userData.rol);
      setHasAccess(hasRole);
    } catch (error) {
      console.error("Error checking user role:", error);
      setHasAccess(false);
    }
  }, [allowedRoles]);

  // Show nothing while checking permissions
  if (hasAccess === null) {
    return null;
  }

  // Return children if user has access, otherwise return fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
