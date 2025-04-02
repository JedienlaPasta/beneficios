"use client";
import { formatDate, formatNumber } from "@/app/lib/utils/format";

export default function TableRow({
  item,
}: {
  item: {
    rut: number;
    dv: string;
    nombres_rsh: string;
    apellidos_rsh: string;
    direccion: string;
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
    tramo,
    ultima_entrega,
  } = item;
  const formattedRut = formatNumber(rut) + (dv ? "-" + dv : "");

  return (
    <tr className="text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="group w-[10%] max-w-56 py-3 pl-10 pr-6 text-slate-700">
        <div className="overflow-hidden text-ellipsis">{formattedRut}</div>
      </td>
      <td className="w-[30%] py-3 pl-10 pr-6 text-slate-700">
        {nombres_rsh + " " + apellidos_rsh}
      </td>
      <td className="w-[15%] py-3 pr-14 text-left text-slate-600">
        {direccion}
      </td>
      <td className="w-[10%] px-6 py-3">
        <span className="inline-block rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-400">
          {tramo}%
        </span>
      </td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">
        {ultima_entrega ? (
          formatDate(ultima_entrega)
        ) : (
          <p className="text-xs font-medium text-slate-400">Sin entregas</p>
        )}
      </td>
    </tr>
  );
}
