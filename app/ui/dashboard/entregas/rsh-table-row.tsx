"use client";
import { formatDate, formatRUT } from "@/app/lib/utils/format";
import { useRouter } from "next/navigation";

export default function RSHTableRow({
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
    // dv,
    nombres_rsh,
    apellidos_rsh,
    direccion,
    direccion_mod,
    sector,
    sector_mod,
    tramo,
    ultima_entrega,
  } = item;
  const router = useRouter();
  const formattedRut = rut ? formatRUT(rut) : "";

  const handleClick = () => {
    if (!rut) return;
    router.push(`/dashboard/entregas/${rut}`);
  };

  const verifiedTramo = tramo !== null ? tramo : 0;

  return (
    <tr
      onClick={handleClick}
      className="grid cursor-pointer grid-cols-26 gap-9 text-nowrap px-6 text-sm tabular-nums transition-colors hover:bg-slate-50"
    >
      <td className="group col-span-4 flex items-center py-3.5 text-slate-600">
        {formattedRut}
      </td>
      <td className="col-span-6 py-3.5 text-slate-600">
        {apellidos_rsh}
        <div className="mt-1 text-xs text-slate-500/90">{nombres_rsh}</div>
      </td>
      <td className="col-span-8 py-3.5 text-left text-slate-600">
        {direccion_mod ? direccion_mod : direccion}
        <p className="mt-1 text-xs text-slate-500/90">
          {sector_mod ? sector_mod : sector}
        </p>
      </td>
      <td className="col-span-4 flex flex-col justify-center py-3.5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-500">
              {verifiedTramo}%
            </span>
            <span className="text-xs text-slate-500">
              {verifiedTramo <= 40
                ? "Bajo"
                : verifiedTramo <= 60
                  ? "Medio bajo"
                  : verifiedTramo <= 80
                    ? "Medio alto"
                    : "Alto"}
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            {/* Progress bar */}
            <div
              className="absolute top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400"
              style={{
                width: `${verifiedTramo}%`,
              }}
            >
              {/* Indicator line */}
              <div className="absolute right-0 top-0 h-full w-0.5 bg-slate-500/30"></div>
            </div>
          </div>
        </div>
      </td>
      <td className="col-span-4 flex flex-col items-end justify-center py-3.5 text-right">
        {ultima_entrega ? (
          <div className="text-slate-600">
            {formatDate(ultima_entrega)}
            <p className="text-xs font-normal text-slate-400">Última entrega</p>
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
