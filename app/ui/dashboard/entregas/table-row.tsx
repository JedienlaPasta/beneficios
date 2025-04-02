"use client";
import { formatDate, formatNumber } from "@/app/lib/utils/format";
// import Link from "next/link";
import { useRouter } from "next/navigation";
// import { CiViewList } from "react-icons/ci";

export default function TableRow({
  item,
}: {
  item: {
    rut: number;
    dv: string;
    nombres_rsh: string;
    apellidos_rsh: string;
    direccion: string;
    tramo: number;
    ultima_entrega: Date;
  };
}) {
  const {
    rut,
    dv,
    nombres_rsh,
    apellidos_rsh,
    direccion,
    tramo,
    ultima_entrega,
  } = item;
  const router = useRouter();
  const formattedRut = formatNumber(rut) + (dv ? "-" + dv : "");

  const stratumColor = [
    [40, "bg-blue-200 text-blue-600 border-blue-400"],
    [50, "bg-blue-200 text-blue-600 border-blue-400/80"],
    [60, "bg-blue-200 text-blue-500 border-blue-300"],
    [70, "bg-blue-200 text-blue-500 border-blue-300"],
    [80, "bg-blue-100 text-blue-400 border-blue-200"],
    [90, "bg-blue-100 text-blue-400 border-blue-200"],
    [100, "bg-blue-100 text-blue-300 border-blue-100"],
  ];

  const stratum = tramo / 10 - 4;

  const handleClick = () => {
    router.push(`/dashboard/entregas/${rut}`);
  };

  return (
    <tr
      onClick={handleClick}
      className="cursor-pointer text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50"
    >
      <td className="group w-[10%] max-w-56 py-3 pl-10 pr-6 text-slate-700">
        <div className="overflow-hidden text-ellipsis">{formattedRut}</div>
      </td>
      <td className="w-[25%] py-3 pl-10 pr-6 text-slate-700">
        {nombres_rsh + " " + apellidos_rsh}
      </td>
      <td className="w-[20%] py-3 pr-14 text-left text-slate-600">
        {direccion}
      </td>
      <td className="w-[5%] px-6 py-3">
        <span
          className={`inline-block rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-400 ${stratumColor[stratum][1] || "bg-gray-50"}`}
        >
          {tramo}%
        </span>
      </td>
      <td className="w-[20%] py-3 pr-14 text-right font-medium text-slate-600">
        {ultima_entrega ? (
          <div className="flex flex-col text-slate-600">
            <span>{formatDate(ultima_entrega)}</span>
            <span className="text-xs text-slate-400">Última Entrega</span>
          </div>
        ) : (
          <div className="text-slate-400/80">Sin entregas</div>
        )}
      </td>
    </tr>
  );
}
