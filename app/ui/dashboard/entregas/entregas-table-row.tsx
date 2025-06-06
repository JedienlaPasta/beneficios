"use client";
import { Entregas } from "@/app/lib/definitions";
import { formatDate, formatRUT } from "@/app/lib/utils/format";
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

  const estadoTextColor =
    estado_documentos === "Finalizado"
      ? "bg-slate-100/80 border-slate-200/80 text-slate-500"
      : "bg-yellow-50 border-yellow-200/80 text-yellow-500";

  return (
    <tr
      onClick={handleClick}
      className="grid cursor-pointer grid-cols-26 gap-8 text-nowrap px-6 text-sm tabular-nums transition-colors hover:bg-slate-200/50"
    >
      <td className="col-span-5 py-4 text-slate-700">{folio}</td>
      <td className="col-span-4 py-4 text-slate-600">
        {formatRUT(String(rut))}
      </td>
      <td className="col-span-9 py-4 text-slate-600">
        {nombres_rsh + " " + apellidos_rsh}
      </td>
      {/* <td className="col-span-4 py-4 text-slate-600">{estado_documentos}</td> */}
      <td className="col-span-4 flex items-center self-center text-slate-600">
        <div className={`rounded-md border px-3 py-1 ${estadoTextColor}`}>
          <p className="z-10">{estado_documentos}</p>
        </div>
      </td>

      <td className="col-span-4 py-4 text-right text-slate-600">
        {formatDate(fecha_entrega)}
      </td>
    </tr>
  );
}
