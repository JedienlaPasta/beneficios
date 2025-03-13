"use client";
import { RSHInfo } from "@/app/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";

export default function RSHGeneralInfo({ data }: { data: RSHInfo[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const lastUodate = data[0].ultima_actualizacion.toString();
  const lastUpdated =
    lastUodate.split(" ")[2] +
    " " +
    lastUodate.split(" ")[1] +
    ", " +
    lastUodate.split(" ")[3];

  const handleClick = (modal: string) => {
    console.log(modal);
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
        <div className="z-1 absolute -top-10 left-[calc(100%-1rem)] h-60 w-[20rem] bg-gradient-to-br from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-12rem)] group-hover:-rotate-[-25deg]"></div>
        <div className="z-10 flex flex-wrap items-center justify-between px-7 py-6">
          <span className="flex flex-col">
            <h3 className="font-mediums text-xs uppercase tracking-wide text-slate-500">
              Ciudadanos Registrados
            </h3>
            <p className="text-2xl font-bold">{data[0].total_registros}</p>
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
        <div className="z-1 absolute -top-10 left-[calc(100%-1rem)] h-60 w-[20rem] bg-gradient-to-br from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-12rem)] group-hover:-rotate-[-25deg]"></div>
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
