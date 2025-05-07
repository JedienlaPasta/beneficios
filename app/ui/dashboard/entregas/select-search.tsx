"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function SelectSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTable = searchParams.get("table") || "ciudadanos";

  const handleClick = (name: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("table", name);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div
        onClick={() => handleClick("ciudadanos")}
        className={`group relative flex min-w-64 grow cursor-pointer flex-col justify-center overflow-hidden rounded-lg border bg-white shadow-md shadow-slate-300/70 transition-all duration-500 hover:shadow-lg ${
          currentTable === "ciudadanos" ? "border-blue-400" : "border-white"
        }`}
      >
        {/* Card content */}
        <div className="z-10 flex items-center justify-between px-5 py-3">
          <div
            className={`absolute left-0 w-1.5 rounded-r bg-blue-400 transition-all duration-500 ${currentTable === "ciudadanos" ? "h-[70%]" : "h-0 opacity-0"}`}
          ></div>
          <div
            className={`flex items-center gap-4 text-slate-600 transition-all duration-500`}
          >
            <span className="text-lg font-medium">Ciudadanos</span>
          </div>
          <div
            className={`absolute right-6 -z-10 size-2 rounded-full border-2 border-white bg-white ring-4 transition-all duration-500 ${currentTable === "ciudadanos" ? "ring-blue-400" : "scale-75 ring-slate-300"}`}
          ></div>
        </div>
      </div>

      <div
        onClick={() => handleClick("entregas")}
        className={`group relative flex min-w-64 grow cursor-pointer flex-col justify-center overflow-hidden rounded-lg border bg-white shadow-md shadow-slate-300/70 transition-all duration-500 hover:shadow-lg ${
          currentTable === "entregas" ? "border-blue-400" : "border-white"
        }`}
      >
        {/* Card content */}
        <div className="z-10 flex items-center justify-between px-5 py-3">
          <div
            className={`absolute left-0 w-1.5 rounded-r bg-blue-400 transition-all duration-500 ${currentTable === "entregas" ? "h-[70%]" : "h-0 opacity-0"}`}
          ></div>
          <div
            className={`flex items-center gap-4 text-slate-600 transition-all duration-500`}
          >
            <span className="text-lg font-medium">Entregas</span>
          </div>
          <div
            className={`absolute right-6 -z-10 size-2 rounded-full border-2 border-white bg-white ring-4 transition-all duration-500 ${currentTable === "entregas" ? "ring-blue-400" : "scale-75 ring-slate-300"}`}
          ></div>
        </div>
      </div>
    </div>
  );
}
