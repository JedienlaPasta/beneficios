"use client";
import { EntregasCampañaDetail } from "@/app/lib/definitions";
import { formatDate, formatNumber } from "@/app/lib/utils/format";
import { useRouter, useSearchParams } from "next/navigation";

type TableRowProps = {
  item: EntregasCampañaDetail;
};

export default function TableRow({ item }: TableRowProps) {
  const { folio, nombres_rsh, apellidos_rsh, rut, dv, fecha_entrega } = item;
  const fecha = formatDate(fecha_entrega);
  const formattedRut = rut ? formatNumber(rut) + (dv ? "-" + dv : "") : "";

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
    <tr className="group grid min-w-[1000px] grid-cols-26 gap-4 text-nowrap px-5 text-sm transition-colors hover:bg-slate-50/80 md:px-6">
      {/* Folio */}
      <td className="col-span-5 self-center py-4">
        <p
          onClick={handleClick}
          className="cursor-pointer text-[13px] tabular-nums text-slate-500 transition-colors hover:text-blue-600 hover:underline"
        >
          {folio}
        </p>
      </td>
      {/* Beneficiario */}
      <td className="col-span-13 py-4">
        <div onClick={handleClick} className="cursor-pointer hover:underline">
          <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-slate-600/90">
            {nombres_rsh}
          </p>
          <p className="text-xs text-slate-500/90">{apellidos_rsh}</p>
        </div>
      </td>
      {/* Rut */}
      <td className="col-span-4 self-center py-4">
        <p
          onClick={handleClick}
          className="cursor-pointer text-right text-[13px] tabular-nums text-slate-500 transition-colors hover:text-blue-600 hover:underline"
        >
          {formattedRut}
        </p>
      </td>
      {/* Fecha Entrega */}
      <td className="col-span-4 self-center py-4 text-right">
        <p className="text-[13px] text-slate-600">{fecha}</p>
      </td>
    </tr>
  );
}
