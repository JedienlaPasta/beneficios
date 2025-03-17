"use client";

import Link from "next/link";
import PerfilUsuario from "./perfil-usuario";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-10">
      <Link href="/dashboard" className="text-xl font-bold text-slate-800">
        Beneficios
      </Link>
      
      <PerfilUsuario />
    </nav>
  );
}