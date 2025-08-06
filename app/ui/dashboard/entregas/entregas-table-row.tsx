"use client";
import { Entregas } from "@/app/lib/definitions";
import {
  formatDate,
  formatRUT,
  formatToTimePassed,
} from "@/app/lib/utils/format";
import { useRouter, useSearchParams } from "next/navigation";

type EntregasProps = {
  item: Entregas;
};

export default function EntregasTableRow({ item }: EntregasProps) {
  const {
    rut,
    folio,
    estado_documentos,
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

  const estadoTextColor =
    estado_documentos === "Finalizado"
      ? "bg-emerald-100 text-emerald-600"
      : "bg-amber-100/60 text-amber-500/90";

  return (
    <tr className="grid grid-cols-26 gap-8 text-nowrap px-5 text-sm tabular-nums transition-colors hover:bg-slate-200/50 md:px-8">
      <td className="col-span-4 flex items-center py-3 text-slate-600">
        <p
          onClick={handleClick}
          className="w-fit cursor-pointer hover:underline"
        >
          {formattedRut}
        </p>
      </td>
      <td className="col-span-9 py-3 text-slate-600">
        <div
          onClick={handleClick}
          className="w-fit cursor-pointer hover:underline"
        >
          {nombres_rsh}
          <p className="mt-0.5 text-xs text-slate-500/90">{apellidos_rsh}</p>
        </div>
      </td>
      <td className="col-span-5 flex items-center py-3 text-slate-600">
        <p onClick={handleClick} className="cursor-pointer hover:underline">
          {folio}
        </p>
      </td>
      {/* <td className="col-span-4 py-3 text-slate-600">{estado_documentos}</td> */}
      <td className="col-span-4 flex items-center self-center text-slate-600">
        <div
          className={`rounded-md px-3 py-1 text-xs font-medium ${estadoTextColor}`}
        >
          <p className="z-10">{estado_documentos}</p>
        </div>
      </td>

      <td className="col-span-4 py-3 text-right text-slate-600">
        <div className="text-slate-600">
          {formatDate(fecha_entrega)}
          <p className="text-xs font-normal text-slate-400">
            {formatToTimePassed(fecha_entrega)}
          </p>
        </div>
      </td>
    </tr>
  );
}
