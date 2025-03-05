"use client";
import { formatDate } from "@/app/lib/utils";
import Link from "next/link";
import { CiViewList } from "react-icons/ci";
import { FiBox } from "react-icons/fi";
import { TbCopy } from "react-icons/tb";
import { toast } from "sonner";

export default function TableRow({
  item,
}: {
  item: {
    id: string;
    nombre: string;
    entregas: number;
    estado: "En curso" | "Finalizado";
    fecha_inicio: Date;
    fecha_termino: Date;
  };
}) {
  const { id, nombre, entregas, estado, fecha_inicio, fecha_termino } = item;

  const inicio = formatDate(fecha_inicio);
  const termino = formatDate(fecha_termino);

  const colorEstado =
    estado === "En curso"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  const copyToClipboard = async (text: string) => {
    console.log(text);
    await navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  return (
    <tr className="text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="group w-[10%] max-w-56 py-3 pl-10 pr-6 font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <div className="overflow-hidden text-ellipsis">{id}</div>
          <div className="hidden rounded p-[3px] hover:bg-slate-200 group-hover:block">
            <TbCopy
              onClick={() => copyToClipboard(id)}
              className="h-5 w-5 shrink-0 cursor-pointer text-slate-500"
            />
          </div>
        </div>
      </td>
      <td className="w-[30%] py-3 pl-10 pr-6 font-medium text-slate-700">
        {nombre}
      </td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">{inicio}</td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">
        {termino}
      </td>
      <td className="w-[10%] px-6 py-3">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${colorEstado}`}
        >
          {estado}
        </span>
      </td>
      <td className="w-[10%] items-center py-3 pl-6 pr-10 text-slate-700">
        <div className="flex items-center gap-3 font-medium text-slate-700/90">
          <div className="col-span-1 flex w-fit justify-start">
            <FiBox />
          </div>
          {entregas}
        </div>
      </td>
      <td className="w-[5%] pl-6 pr-10 text-right">
        <div className="flex items-center justify-end">
          <Link
            href={`/dashboard/campanas/${id}`}
            className="w-fit rounded p-1 font-medium text-slate-700/90 hover:bg-blue-100 hover:text-blue-600"
          >
            <CiViewList className="h-6 w-6 cursor-pointer" />
          </Link>
        </div>
      </td>
    </tr>
  );
}
