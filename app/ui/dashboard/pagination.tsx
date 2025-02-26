"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function Pagination({ totalPaginas }: { totalPaginas: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paginaActual = Number(searchParams.get("page")) || 1;

  const URLPaginaActual = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const numeroPaginas = [];
  for (let i = 1; i <= totalPaginas; i++) {
    numeroPaginas.push(i);
  }

  const paginas = numeroPaginas.map((numero, index) => (
    <li key={index}>
      <Link
        href={URLPaginaActual(numero)}
        className={`${numero === paginaActual ? "bg-blue-300" : "bg-white"} text-slate-600" flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-sm`}
      >
        {numero}
      </Link>
    </li>
  ));

  return (
    <nav
      className="flex items-center justify-between border-t border-gray-200 bg-white px-4 sm:px-0"
      aria-label="Pagination"
    >
      <ul className="flex gap-2 p-2">
        <Link
          href={URLPaginaActual(paginaActual - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500"
        >
          <MdKeyboardArrowLeft className="text-xl" />
        </Link>

        {paginas}
        <Link
          href={URLPaginaActual(paginaActual + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-500"
        >
          <MdKeyboardArrowRight className="text-xl" />
        </Link>
      </ul>
    </nav>
  );
}
