"use client";
import { EntregasTable } from "@/app/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatTime } from "@/app/lib/utils/format";

export default function TableRow({ item }: { item: EntregasTable }) {
  const { folio, fecha_entrega, nombre_usuario, estado_documentos } = item;
  const fecha = formatDate(fecha_entrega);
  const hora = formatTime(fecha_entrega);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set("detailsModal", folio);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const estadoTextColor =
    estado_documentos === "Finalizado"
      ? "bg-emerald-100 text-emerald-600"
      : "bg-amber-100/60 text-amber-500/90";

  return (
    <tr className="grid grid-cols-26 gap-8 text-nowrap px-5 text-sm tabular-nums transition-colors hover:bg-slate-200/50 md:px-8">
      <td className="col-span-7 flex min-h-12 items-center">
        <p
          onClick={handleClick}
          className="cursor-pointer text-slate-600 hover:underline"
        >
          {folio}
        </p>
      </td>
      <td className="col-span-10 flex items-center py-3 text-slate-600">
        {nombre_usuario}
      </td>
      <td className="col-span-5 flex h-11 min-h-11 items-center self-center text-slate-600">
        <div
          className={`rounded-md px-3 py-1 text-xs font-medium ${estadoTextColor}`}
        >
          <p className="z-10">{estado_documentos}</p>
        </div>
      </td>
      <td className="col-span-4 flex items-center justify-end py-3 text-right text-slate-600">
        <div>
          <p>{fecha}</p>
          <p className="text-xs text-slate-500">{hora}</p>
        </div>
      </td>
    </tr>
  );
}
