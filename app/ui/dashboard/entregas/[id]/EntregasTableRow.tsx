"use client";
import { EntregasTable } from "@/app/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatTime } from "@/app/lib/utils/format";
import { FileText } from "lucide-react";

export default function TableRow({ item }: { item: EntregasTable }) {
  const {
    folio,
    fecha_entrega,
    nombre_usuario,
    estado_documentos,
    cantidad_documentos,
  } = item;
  const fecha = formatDate(fecha_entrega);
  const hora = formatTime(fecha_entrega);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set("detailsModal", folio);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  let stateColor;
  if (estado_documentos === "Anulado") {
    stateColor = "bg-red-100/70 text-red-600 ring-red-600/5";
  } else if (estado_documentos === "En Curso") {
    stateColor = "bg-purple-100/70 text-purple-600 ring-purple-600/5";
  } else if (estado_documentos === "Finalizado") {
    stateColor = "bg-emerald-100/70 text-emerald-600 ring-emerald-600/5";
  }

  return (
    <tr className="group grid min-w-[1000px] grid-cols-26 gap-4 text-nowrap px-5 text-sm transition-colors hover:bg-slate-50/80 md:px-6">
      {/* Folio */}
      <td className="col-span-6 self-center py-4">
        <p
          onClick={handleClick}
          className="cursor-pointer text-[13px] tabular-nums text-slate-500 transition-colors hover:text-blue-600 hover:underline"
        >
          {folio}
        </p>
      </td>
      {/* Encargado */}
      <td className="col-span-9 self-center py-4">
        <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-slate-600/90">
          {nombre_usuario}
        </p>
      </td>
      {/* Documentos */}
      <td className="col-span-4 flex items-center justify-end py-4">
        <div
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition-colors ${
            (cantidad_documentos || 0) >= 4
              ? "bg-emerald-100/70 text-emerald-600 ring-emerald-600/5"
              : "bg-slate-100/70 text-slate-600 ring-slate-700/5"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="tabular-nums">{cantidad_documentos || 0}/4</span>
        </div>
      </td>
      {/* Estado */}
      <td className="col-span-3 flex items-center justify-start py-4">
        <div
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${stateColor}`}
        >
          <p className="z-10">{estado_documentos}</p>
        </div>
      </td>
      {/* Entrega */}
      <td className="col-span-4 flex flex-col items-end py-4 text-right">
        <p className="text-[13px] text-slate-600">{fecha}</p>
        <p className="text-xs text-slate-400">{hora}</p>
      </td>
    </tr>
  );
}
