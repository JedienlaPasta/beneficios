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
    <div className="grid grid-cols-2 gap-4">
      <div
        onClick={() => handleClick("newcitizen")}
        className="group relative flex min-w-64 flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300 transition-all hover:shadow-lg hover:shadow-slate-400/40"
      >
        <div className="z-1 absolute -top-10 left-[calc(100%-1rem)] h-72 w-[20rem] bg-gradient-to-br from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-12rem)] group-hover:-rotate-[-25deg]"></div>
        <div className="z-10 flex flex-wrap items-center justify-between px-7 py-6">
          <span className="flex flex-col">
            <h3 className="font-mediums text-xs uppercase tracking-wide text-slate-500">
              Ciudadanos Registrados
            </h3>
            <p className="text-2xl font-bold">
              {data[0]
                ? formatNumber(data[0].total_registros)
                : "No hay registros"}
            </p>
          </span>
          <span className="flex flex-col items-end justify-center">
            <p className="text-lg font-semibold text-slate-700 transition-colors duration-300 group-hover:text-white">
              Nuevo Registro
            </p>
          </span>
        </div>
      </div>
      <div
        onClick={() => handleClick("importxlsx")}
        className="group relative flex min-w-64 flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300 transition-all hover:shadow-lg hover:shadow-slate-400/40"
      >
        <div className="z-1 absolute -top-10 left-[calc(100%-1rem)] h-64 w-[20rem] bg-gradient-to-br from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-12rem)] group-hover:-rotate-[-25deg]"></div>
        <div className="z-10 flex flex-wrap items-center justify-between px-7 py-6">
          <span className="flex flex-col items-start justify-center">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Última Actualización
            </p>
            <p className="text-xl font-semibold text-slate-700">
              {lastUpdated}
            </p>
          </span>
          <span className="flex flex-col items-start justify-center">
            <p className="text-lg font-semibold text-slate-700 transition-colors duration-300 group-hover:text-white">
              Importar XLSX
            </p>
          </span>
        </div>
      </div>
    </div>
  );
}
