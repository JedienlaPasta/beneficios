"use client";
import { RSHInfo } from "@/app/lib/definitions";
import { formatNumber } from "@/app/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export default function RSHGeneralInfo({ data }: { data: RSHInfo[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const lastUpdate = data[0]?.ultima_actualizacion.toString();
  const lastUpdated = data[0]
    ? lastUpdate.split(" ")[2] +
      " " +
      lastUpdate.split(" ")[1] +
      ", " +
      lastUpdate.split(" ")[3]
    : "No hay datos asociados";

  const handleClick = (modal: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(modal, "open");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-6">
      <div
        onClick={() => handleClick("newcitizen")}
        className="group relative flex min-w-80 flex-1 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300 transition-all duration-300 hover:shadow-lg hover:shadow-slate-400/40"
      >
        {/* Decorative gradient element */}
        <div className="absolute left-[calc(100%-1rem)] top-0 h-60 w-[20rem] bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-8rem)] group-hover:-rotate-[-25deg]"></div>

        {/* Card content */}
        <div className="z-10 flex items-center justify-between px-7 py-5">
          <div>
            <div className="flex items-center gap-4 pt-1 text-slate-700">
              <span className="flex flex-col items-start">
                <h5 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Ciudadanos Registrados
                </h5>
                <p className="text-3xl font-bold text-blue-600">
                  {data[0]
                    ? formatNumber(data[0].total_registros)
                    : "No hay registros"}
                </p>
              </span>
            </div>
          </div>
          <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-500 transition-all duration-500 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
          </div>
        </div>

        {/* Action label */}
        <div className="mt-auto border-t border-slate-100 px-7 py-3">
          <p className="text-sm font-medium text-slate-700 transition-colors duration-300 group-hover:text-blue-600">
            Nuevo Registro
          </p>
        </div>
      </div>

      <div
        onClick={() => handleClick("importxlsx")}
        className="group relative flex min-w-80 flex-1 shrink-0 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300 transition-all duration-300 hover:shadow-lg hover:shadow-slate-400/40"
      >
        {/* Decorative gradient element */}
        <div className="absolute left-[calc(100%-1rem)] top-0 h-60 w-[20rem] bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-8rem)] group-hover:-rotate-[-25deg]"></div>

        {/* Card content */}
        <div className="z-10 flex items-center justify-between px-7 py-5">
          <div>
            <div className="flex items-center gap-4 pt-1 text-slate-700">
              <span className="flex flex-col items-start">
                <h5 className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Última Actualización
                </h5>
                <p className="mt-1 flex items-center text-xs text-slate-500">
                  <svg
                    className="mr-1 h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {lastUpdated}
                </p>
              </span>
            </div>
          </div>
          <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-500 transition-all duration-500 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"
              />
            </svg>
          </div>
        </div>

        {/* Action label */}
        <div className="mt-auto border-t border-slate-100 px-7 py-3">
          <p className="text-sm font-medium text-slate-700 transition-colors duration-300 group-hover:text-blue-600">
            Importar XLSX
          </p>
        </div>
      </div>
    </div>
  );
}
