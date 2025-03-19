"use client";
import { SocialAidTableRow } from "@/app/lib/definitions";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDate } from "@/app/lib/utils";

export default function TableRow({ item }: { item: SocialAidTableRow }) {
  const { folio, fecha_entrega, nombre_usuario, observacion } = item;
  const fecha = formatDate(fecha_entrega);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);
    params.set("detailsModal", folio);

    // Use router.replace instead of router.push to avoid adding to history
    // and add the scroll=false option to prevent scrolling to top
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <tr
      onClick={handleClick}
      className="cursor-pointer text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50"
    >
      <td className="w-[25%] py-3 pl-10 pr-6 font-medium text-slate-700">
        {folio}
      </td>
      {/* <td className="w-[20%] py-3 pl-10 pr-6 text-slate-600">
          {nombre_campaña}
        </td> */}
      {/* <td className="w-[15%] py-3 pl-10 pr-6 text-slate-600">{detalle}</td> */}
      <td className="w-[25%] py-3 pl-10 pr-6 text-slate-600">
        {observacion || "No especifica"}
      </td>
      <td className="w-[25%] py-3 pl-10 pr-6 text-slate-600">
        {nombre_usuario}
      </td>
      <td className="w-[25%] py-3 pr-10 text-right text-slate-600">{fecha}</td>
    </tr>
  );
}
