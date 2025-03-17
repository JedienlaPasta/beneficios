"use client";
import { useState, useEffect, useRef } from "react";
import { HiChevronDown } from "react-icons/hi2";
import { FiLogOut, FiUser } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function PerfilUsuario() {
  const [userSession, setUserSession] = useState<{
    nombre: string;
    cargo: string;
    rol: string;
    correo: string;
  } | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Get user session from localStorage
    const sessionData = localStorage.getItem("userSession");
    if (sessionData) {
      try {
        const parsedData = JSON.parse(sessionData);
        setUserSession(parsedData);
      } catch (error) {
        console.error("Error parsing user session:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        // Clear localStorage
        localStorage.removeItem("userSession");

        // Clear cookie by setting expiration to past date
        document.cookie =
          "userSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

        toast.success("Sesión cerrada correctamente");

        // Force a complete page reload to clear any cached state
        window.location.href = "/";
      } else {
        toast.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Error de conexión");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-slate-800"
        onClick={() => setDropdownOpen(!dropdownOpen)}
      >
        <div className="h-9 w-9 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-600">
          <div className="flex h-full w-full items-center justify-center text-lg font-medium text-white">
            {userSession ? userSession.nombre.charAt(0) : "U"}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200">
            {userSession ? userSession.nombre : "Cargando..."}
          </p>
          <p className="text-xs text-slate-400">
            {userSession ? userSession.cargo : "..."}
          </p>
        </div>
        <HiChevronDown
          className={`h-5 w-5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
        />
      </button>

      {dropdownOpen && (
        <div className="absolute bottom-full right-0 z-50 mb-2 w-40 rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
          <div className="p-1.5">
            <Link
              href="/dashboard/perfil"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 hover:bg-slate-700"
              onClick={() => setDropdownOpen(false)}
            >
              <FiUser className="text-base" />
              Ver perfil
            </Link>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-slate-700"
            >
              <FiLogOut className="text-base" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
