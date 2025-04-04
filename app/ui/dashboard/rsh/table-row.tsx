"use client";
import {
  capitalizeAll,
  formatDate,
  formatNumber,
} from "@/app/lib/utils/format";
import { JSX } from "react";

export default function TableRow({
  item,
}: {
  item: {
    rut: number;
    dv: string;
    nombres_rsh: string;
    apellidos_rsh: string;
    direccion: string;
    sector: string;
    tramo: number;
    ultima_entrega: Date;
  };
}) {
  const {
    rut,
    dv,
    nombres_rsh,
    apellidos_rsh,
    direccion,
    sector,
    tramo,
    ultima_entrega,
  } = item;
  const formattedRut = formatNumber(rut) + (dv ? "-" + dv : "");
  const tramoBarsLength = 10 - tramo / 10;
  const tramoBars: JSX.Element[] = [];
  // for (let i = 0; i < tramoBarsLength; i++) {
  //   tramoBars.push(
  //     <span
  //       key={i}
  //       className="inline-block h-2.5 w-[16%] rounded-[3px] border border-blue-200 bg-blue-50"
  //     ></span>,
  //   );
  // }
  for (let i = 0; i < 6; i++) {
    tramoBars.push(
      <span
        key={i}
        className={`inline-block h-2.5 w-[16%] rounded-[3px] border border-blue-200 ${i < tramoBarsLength ? "bg-gradient-to-br from-sky-300 to-blue-400" : "bg-blue-50"}`}
      ></span>,
    );
  }

  return (
    <tr className="grid grid-cols-26 gap-9 text-nowrap px-6 text-sm tabular-nums transition-colors hover:bg-slate-50">
      <td className="group col-span-4 flex items-center py-4 text-slate-600">
        <div className="">{formattedRut}</div>
      </td>
      <td className="col-span-6 py-4 text-slate-600">
        <div className="">{apellidos_rsh}</div>
        <div className="mt-1 text-xs text-slate-500/90">{nombres_rsh}</div>
      </td>
      <td className="col-span-8 py-4 text-left text-slate-600">
        <p className="">{direccion}</p>
        <p className="mt-1 text-xs text-slate-500/90">{sector}</p>
      </td>
      <td className="col-span-4 flex flex-col justify-center py-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-500">{tramo}%</span>
            <span className="text-xs text-slate-500">
              {tramo <= 40
                ? "Bajo"
                : tramo <= 60
                  ? "Medio bajo"
                  : tramo <= 80
                    ? "Medio alto"
                    : "Alto"}
            </span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            {/* Progress bar */}
            <div
              className="absolute top-0 h-full bg-gradient-to-r from-blue-500 to-blue-400"
              style={{
                width: `${tramo}%`,
              }}
            >
              {/* Indicator line */}
              <div className="absolute right-0 top-0 h-full w-0.5 bg-slate-500/30"></div>
            </div>
          </div>
        </div>
      </td>
      <td className="col-span-4 flex flex-col items-end justify-center py-4 text-right">
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
