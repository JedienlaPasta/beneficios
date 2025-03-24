"use client";
import { SocialAidTableRow } from "@/app/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate } from "@/app/lib/utils";

export default function TableRow({ item }: { item: SocialAidTableRow }) {
  const { folio, fecha_entrega, nombre_usuario, estado_documentos } = item;
  const fecha = formatDate(fecha_entrega);
  const hora = fecha_entrega.toString().split(" ")[4];
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
      className="h-12 cursor-pointer text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50"
    >
      <td className="flex h-12 min-h-12 w-[30%] items-center px-10 text-slate-600">
        {folio}
      </td>
      <td className="w-[30%] py-3 text-slate-600">{nombre_usuario}</td>
      <td className="h-11 min-h-11 w-[15%] text-slate-600">
        <div
          className={`flex w-fit items-center gap-2 rounded-md px-2 py-1 ${estadoTextColor}`}
        >
          <span
            className={`z-10 h-1.5 w-1.5 shrink-0 rounded-full ${estadoDotColor} animate-pulse`}
          ></span>
          <p className="z-10">{estado_documentos}</p>
        </div>
      </td>
      <td className="py-30 w-[25%] px-10 text-right text-slate-600">
        <div>
          <p>{fecha}</p>
          <p className="text-xs text-slate-500">{hora}</p>
        </div>
      </td>
    </tr>
  );
}
