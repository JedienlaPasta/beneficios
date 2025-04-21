"use client";
import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-8xl font-bold text-slate-700">404</h1>
        <h2 className="mb-2 text-xl font-semibold text-slate-600">
          Página no encontrada
        </h2>
        <p className="mb-6 text-gray-600">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <Link
          href="/"
          className="inline-block rounded-md bg-slate-700 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-800/95"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
