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
      const userRoleCookie = cookies.find(cookie => 
        cookie.trim().startsWith("userRole=")
      );
      
      if (!userRoleCookie) {
        console.log("No userRole cookie found");
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
        console.log("Invalid user role data in cookie");
        setHasAccess(false);
        return;
      }

      const hasRole = allowedRoles.includes(userData.rol);
      console.log(`User role: ${userData.rol}, Access granted: ${hasRole}`);
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
