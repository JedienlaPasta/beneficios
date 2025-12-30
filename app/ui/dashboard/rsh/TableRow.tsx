"use client";
import {
  formatDate,
  formatNumber,
  formatToTimePassed,
} from "@/app/lib/utils/format";
import { useRouter, useSearchParams } from "next/navigation";

export default function TableRow({
  item,
}: {
  item: {
    rut: number | null;
    dv: string;
    nombres_rsh: string;
    apellidos_rsh: string;
    direccion: string;
    direccion_mod?: string;
    sector: string;
    sector_mod?: string;
    tramo: number | null;
    ultima_entrega: Date | null;
  };
}) {
  const {
    rut,
    dv,
    nombres_rsh,
    apellidos_rsh,
    direccion,
    direccion_mod,
    sector,
    sector_mod,
    tramo,
    ultima_entrega,
  } = item;
  const formattedRut = rut ? formatNumber(rut) + (dv ? "-" + dv : "") : "";
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    if (!rut) return;
    const params = new URLSearchParams(searchParams);
    params.set("citizen", rut.toString());
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const verifiedTramo = tramo !== null ? tramo : 0;

  let tramoColor = "";
  if (verifiedTramo <= 40) {
    tramoColor = "bg-indigo-50 text-indigo-600 ring-indigo-600/5";
  } else {
    tramoColor = "bg-slate-50 text-slate-600 ring-slate-700/5";
  }

  return (
    <tr className="group grid min-w-[1000px] grid-cols-26 gap-4 text-nowrap px-5 text-sm transition-colors hover:bg-slate-50/80 md:px-6">
      {/* RUT */}
      <td className="col-span-4 flex items-center py-4">
        <p
          onClick={handleClick}
          className="cursor-pointer text-[13px] tabular-nums text-slate-500 transition-colors hover:text-blue-600 hover:underline"
        >
          {formattedRut}
        </p>
      </td>
      {/* Nombre */}
      <td className="col-span-7 py-4">
        <div onClick={handleClick} className="cursor-pointer hover:underline">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-slate-600/90">
            {nombres_rsh}
          </p>
          <p className="text-xs text-slate-500/90">{apellidos_rsh}</p>
        </div>
      </td>
      {/* Direccion */}
      <td className="col-span-8 py-4">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-slate-600/90">
          {direccion_mod ? direccion_mod : direccion}
        </p>
        <p className="text-xs text-slate-500/90">
          {sector_mod ? sector_mod : sector}
        </p>
      </td>
      {/* Tramo */}
      <td className="col-span-3 flex flex-col justify-center py-4">
        <div className="flex items-center justify-center">
          <span
            className={`rounded-full px-3 py-1 text-xs font-black ring-1 ring-inset ${tramoColor}`}
          >
            {verifiedTramo}%
          </span>
        </div>
      </td>

      {/* Última Entrega */}
      <td className="col-span-4 flex flex-col items-end justify-center py-4 text-right">
        {ultima_entrega ? (
          <div className="text-[13px] text-slate-600">
            {formatDate(ultima_entrega)}
            <p className="text-xs text-slate-400">
              {formatToTimePassed(ultima_entrega)}
            </p>
          </div>
        ) : (
          <span className="rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500 ring-1 ring-inset ring-slate-200">
            Sin entregas
          </span>
        )}
      </td>
    </tr>
  );
}
