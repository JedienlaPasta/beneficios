"use client";
import { SocialAidTableRow } from "@/app/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate, formatTime } from "@/app/lib/utils/format";

export default function TableRow({ item }: { item: SocialAidTableRow }) {
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
      ? "bg-blue-100 text-blue-500"
      : "bg-orange-100/80 text-orange-500/70";
  const estadoDotColor =
    estado_documentos === "Finalizado" ? "bg-blue-300" : "bg-orange-300";

  return (
    <tr
      onClick={handleClick}
      className="grid cursor-pointer grid-cols-26 text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50"
    >
      <td className="col-span-5 flex min-h-12 items-center px-10 text-slate-600">
        {folio}
      </td>
      <td className="col-span-13 flex items-center py-3 text-slate-600">
        {nombre_usuario}
      </td>
      <td className="col-span-4 flex h-11 min-h-11 items-center self-center text-slate-600">
        <div
          className={`flex w-fit items-center gap-2 rounded-md px-2 py-1 ${estadoTextColor}`}
        >
          <span
            className={`z-10 h-1.5 w-1.5 shrink-0 rounded-full ${estadoDotColor} animate-pulse`}
          ></span>
          <p className="z-10">{estado_documentos}</p>
        </div>
      </td>
      <td className="col-span-4 flex items-center justify-end px-10 py-3 text-right text-slate-600">
        <div>
          <p>{fecha}</p>
          <p className="text-xs text-slate-500">{hora}</p>
        </div>
      </td>
    </tr>
  );
}
