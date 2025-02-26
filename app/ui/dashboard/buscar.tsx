"use client";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";
import { useDebouncedCallback } from "use-debounce";
// import { RiCloseLine } from "react-icons/ri";

type BarraBuscarProps = {
  placeholder: string;
};
export default function Buscar({ placeholder }: BarraBuscarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const manejarBusqueda = useDebouncedCallback((busqueda: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    if (busqueda) {
      params.set("query", busqueda);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 500);

  return (
    <div className="relative">
      <div className="flex h-11 w-72 items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
        <FiSearch className="text-lg text-slate-400" />
        <input
          type="text"
          placeholder={placeholder}
          onChange={(e) => manejarBusqueda(e.target.value)}
          defaultValue={searchParams.get("query")?.toString()}
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
        {/* {busqueda && (
          <RiCloseLine
            className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
            onClick={() => setBusqueda("")}
          />
        )} */}
      </div>
    </div>
  );
}
