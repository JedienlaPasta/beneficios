"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function Pagination({ paginas }: { paginas: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paginaActual = Number(searchParams.get("page")) || 1;

  const URLPaginaActual = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const numeroPaginas = [];
  for (let i = 1; i <= paginas; i++) {
    numeroPaginas.push(i);
  }

  const arrayPaginas = numeroPaginas.map((numero, index) => (
    <li key={index}>
      <Link
        href={URLPaginaActual(numero)}
        className={`${numero === paginaActual ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : "bg-white hover:bg-slate-200"} text-slate-600" flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs`}
      >
        {numero}
      </Link>
    </li>
  ));

  const calcularCambioPagina = (sentido: "subir" | "bajar") => {
    if (sentido === "bajar") {
      if (paginaActual > 1) {
        return paginaActual - 1;
      } else {
        return 1;
      }
    } else {
      if (paginaActual < paginas) {
        return paginaActual + 1;
      } else {
        return paginas;
      }
    }
  };

  return (
    <nav
      className="flex items-center justify-between border-t border-gray-200/70 bg-white px-4 sm:px-0"
      aria-label="Pagination"
    >
      <ul className="flex gap-2 p-2">
        <Link
          href={URLPaginaActual(calcularCambioPagina("bajar"))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-600"
        >
          <MdKeyboardArrowLeft className="text-xl" />
        </Link>

        {arrayPaginas}
        <Link
          href={URLPaginaActual(calcularCambioPagina("subir"))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-600"
        >
          <MdKeyboardArrowRight className="text-xl" />
        </Link>
      </ul>
    </nav>
  );
}
