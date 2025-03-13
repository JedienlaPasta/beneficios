"use client";
import { formatDate, formatNumber } from "@/app/lib/utils";
import Link from "next/link";
import { CiViewList } from "react-icons/ci";

export default function TableRow({
  item,
}: {
  item: {
    rut: number;
    dv: string;
    nombres: string;
    apellidos: string;
    direccion: string;
    tramo: number;
    ultima_entrega: Date;
  };
}) {
  const { rut, dv, nombres, apellidos, direccion, tramo, ultima_entrega } =
    item;
  const formattedRut = formatNumber(rut) + (dv ? "-" + dv : "");

  return (
    <tr className="text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="group w-[10%] max-w-56 py-3 pl-10 pr-6 text-slate-700">
        <div className="overflow-hidden text-ellipsis">{formattedRut}</div>
      </td>
      <td className="w-[30%] py-3 pl-10 pr-6 text-slate-700">
        {nombres + " " + apellidos}
      </td>
      <td className="w-[15%] py-3 pr-14 text-left text-slate-600">
        {direccion}
      </td>
      <td className="w-[10%] px-6 py-3">
        <span className="inline-block rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-400">
          {tramo}%
        </span>
      </td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">
        {ultima_entrega ? formatDate(ultima_entrega) : ""}
      </td>
      <td className="w-[5%] pl-6 pr-10 text-right">
        <div className="flex items-center justify-end">
          <Link
            href={`/dashboard/rsh/${rut}`}
            className="w-fit rounded p-1 font-medium text-slate-700/90 hover:bg-blue-100 hover:text-blue-600"
          >
            <CiViewList className="h-6 w-6 cursor-pointer" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
