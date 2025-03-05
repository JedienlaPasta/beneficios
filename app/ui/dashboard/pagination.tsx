"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function Pagination({ pages }: { pages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const URLCurrentPage = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const pageNumber = [];
  for (let i = 1; i <= pages; i++) {
    pageNumber.push(i);
  }

  const arrayPaginas = pageNumber.map((numero, index) => (
    <li key={index}>
      <Link
        href={URLCurrentPage(numero)}
        className={`${numero === currentPage ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" : "bg-white hover:bg-slate-200"} text-slate-600" flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs`}
      >
        {numero}
      </Link>
    </li>
  ));

  const calcularCambioPagina = (direction: "right" | "left") => {
    if (direction === "left") {
      if (currentPage > 1) {
        return currentPage - 1;
      } else {
        return 1;
      }
    } else {
      if (currentPage < pages) {
        return currentPage + 1;
      } else {
        return pages;
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
          href={URLCurrentPage(calcularCambioPagina("left"))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-600"
        >
          <MdKeyboardArrowLeft className="text-xl" />
        </Link>

        {arrayPaginas}
        <Link
          href={URLCurrentPage(calcularCambioPagina("right"))}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-200 hover:text-slate-600"
        >
          <MdKeyboardArrowRight className="text-xl" />
        </Link>
      </ul>
    </nav>
  );
}
