"use client";
import { Entregas } from "@/app/lib/definitions";
import {
  formatDate,
  formatRUT,
  formatToTimePassed,
} from "@/app/lib/utils/format";
import { FileText } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

type EntregasProps = {
  item: Entregas;
};

export default function EntregasTableRow({ item }: EntregasProps) {
  const {
    rut,
    folio,
    estado_documentos,
    cantidad_documentos,
    fecha_entrega,
    nombres_rsh,
    apellidos_rsh,
  } = item;

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    if (!rut || !folio) return;
    const params = new URLSearchParams(searchParams);
    params.set("detailsModal", folio);
    params.set("rut", String(rut));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const formattedRut = rut ? formatRUT(rut) : "";

  let stateColor;
  if (estado_documentos === "Anulado") {
    stateColor = "bg-red-100 text-red-600 ring-red-600/20";
  } else if (estado_documentos === "En Curso") {
    stateColor = "bg-amber-100/60 text-amber-500/90 ring-amber-600/20";
  } else if (estado_documentos === "Finalizado") {
    stateColor = "bg-emerald-100 text-emerald-700 ring-emerald-600/20";
  }

  return (
    <tr className="group grid grid-cols-26 gap-4 text-nowrap px-5 text-sm transition-colors hover:bg-slate-50/80 md:px-8">
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
      <td className="col-span-6 w-fit py-4">
        <div onClick={handleClick} className="cursor-pointer hover:underline">
          <p className="font-semibold text-slate-600">{nombres_rsh}</p>
          <p className="text-xs text-slate-500/90">{apellidos_rsh}</p>
        </div>
      </td>
      {/* Folio */}
      <td className="col-span-4 flex items-center justify-end py-4">
        <p
          onClick={handleClick}
          className="font-monos cursor-pointer text-[13px] tabular-nums text-slate-500 transition-colors hover:text-blue-600 hover:underline"
        >
          {folio}
        </p>
      </td>
      {/* Documentos */}
      <td className="col-span-4 flex items-center justify-end py-4">
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
            cantidad_documentos! >= 4
              ? "bg-emerald-100 text-emerald-700 ring-emerald-700/20"
              : "bg-slate-100 text-slate-600 ring-slate-700/10"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="tabular-nums">{cantidad_documentos || 0}/4</span>
        </div>
      </td>
      {/* Estado */}
      <td className="col-span-4 flex items-center self-center text-slate-600">
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${stateColor}`}
        >
          <p className="z-10">{estado_documentos}</p>
        </div>
      </td>
      {/* Fecha */}
      <td className="col-span-4 flex flex-col items-end py-4 text-right">
        <p className="text-[13px] text-slate-600">
          {formatDate(fecha_entrega)}
        </p>
        <p className="text-xs text-slate-400">
          {formatToTimePassed(fecha_entrega)}
        </p>
      </td>
    </tr>
  );
}
