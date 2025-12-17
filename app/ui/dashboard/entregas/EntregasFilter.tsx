"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { Filter, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function EntregasFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const userParam = searchParams.get("user");
  const userFilter = userParam !== "all";
  const statusParam = searchParams.get("status");
  const currentStatuses = statusParam ? statusParam.split(",") : [];

  const handleUserToggle = () => {
    const params = new URLSearchParams(searchParams);
    if (userFilter) {
      // Currently active (me), switch to all
      params.set("user", "all");
    } else {
      // Currently all, switch to me (default)
      params.delete("user");
    }
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  const handleStatusToggle = (status: string) => {
    const params = new URLSearchParams(searchParams);
    let newStatuses = [...currentStatuses];

    if (newStatuses.includes(status)) {
      newStatuses = newStatuses.filter((s) => s !== status);
    } else {
      newStatuses.push(status);
    }

    if (newStatuses.length > 0) {
      params.set("status", newStatuses.join(","));
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.set("user", "all");
    params.delete("status");
    params.set("page", "1");
    replace(`${pathname}?${params.toString()}`);
    setIsOpen(false);
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

  const hasFilters = userFilter || currentStatuses.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium transition-colors hover:border-blue-200 ${
          hasFilters ? "text-blue-600" : "text-slate-600"
        }`}
      >
        <Filter className="h-4 w-4" />
        Filtrar
        {hasFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
            {(userFilter ? 1 : 0) + currentStatuses.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="mb-2 px-2 py-1 text-xs font-semibold uppercase text-slate-400">
            Filtros
          </div>

          <button
            onClick={handleUserToggle}
            className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            <span>Mis entregas</span>
            {userFilter && <Check className="h-4 w-4 text-blue-600" />}
          </button>

          <div className="my-1 border-t border-slate-100" />

          {["En Curso", "Finalizado", "Anulado"].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusToggle(status)}
              className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              <span>{status}</span>
              {currentStatuses.includes(status) && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}

          <div className="my-1 border-t border-slate-100" />

          <button
            onClick={clearFilters}
            className="w-full rounded-md px-2 py-2 text-left text-sm text-blue-600 hover:bg-blue-50"
          >
            Todas (Limpiar filtros)
          </button>
        </div>
      )}
    </div>
  );
}
