"use client";
import { EntregasCampañaDetail } from "@/app/lib/definitions";
import { formatDate, formatNumber } from "@/app/lib/utils/format";
import { getDV } from "@/app/lib/utils/get-values";
import { useRouter, useSearchParams } from "next/navigation";

type TableRowProps = {
  item: EntregasCampañaDetail;
};

export default function TableRow({ item }: TableRowProps) {
  const { folio, nombres_rsh, apellidos_rsh, rut, fecha_entrega } = item;
  const fecha = formatDate(fecha_entrega);
  const formatted_rut = formatNumber(Number(rut)) + (rut && "-" + getDV(rut));

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = () => {
    if (!rut || !folio) return;
    const params = new URLSearchParams(searchParams);
    params.set("detailsModal", folio);
    params.set("rut", String(rut));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <tr
      onClick={handleClick}
      className="grid cursor-pointer grid-cols-26 gap-8 text-nowrap px-8 text-sm tabular-nums transition-colors hover:bg-slate-200/50"
    >
      <td className="col-span-5 py-4 text-slate-700">{folio}</td>
      <td className="col-span-13 py-4 text-slate-600">
        {nombres_rsh} {apellidos_rsh}
      </td>
      <td className="col-span-4 py-4 text-right text-slate-600">
        {formatted_rut}
      </td>
      <td className="col-span-4 py-4 text-right text-slate-600">{fecha}</td>
    </tr>
  );
}
