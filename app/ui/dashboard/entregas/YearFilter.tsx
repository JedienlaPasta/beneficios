"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Calendar, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function YearFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentYear = new Date().getFullYear();
  const yearParam = searchParams.get("year");
  // Si no hay parámetro, asumimos el año actual
  const activeYear = yearParam || currentYear.toString();

  // Generar lista de años desde 2025 hasta el año actual
  const startYear = 2025;
  const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) =>
    (currentYear - i).toString(),
  );

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams);
    if (year === currentYear.toString()) {
      // Si es el año actual, limpiamos el parámetro para mantener la URL limpia
      params.delete("year");
    } else {
      params.set("year", year);
    }
    // Siempre reiniciamos a la página 1 al cambiar filtros
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm transition-colors hover:border-blue-200"
      >
        <Calendar className="h-4 w-4 text-slate-500" />
        <span className="text-xs font-medium text-blue-600">{activeYear}</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-36 rounded-lg border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="mb-2 px-2 py-1 text-xs font-semibold uppercase text-slate-400">
            Año Entrega
          </div>

          <div className="my-1 border-t border-slate-100" />

          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearChange(year)}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <span>{year}</span>
              {year === activeYear && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
