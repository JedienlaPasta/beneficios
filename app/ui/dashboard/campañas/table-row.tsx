"use client";
import { formatDate } from "@/app/lib/utils/format";
// import Link from "next/link";
import { useRouter } from "next/navigation";
// import { CiViewList } from "react-icons/ci";
import { FiBox } from "react-icons/fi";
import { TbCopy } from "react-icons/tb";
import { toast } from "sonner";

export default function TableRow({
  item,
}: {
  item: {
    id: string;
    nombre_campaña: string;
    entregas: number;
    estado: "En curso" | "Finalizado";
    fecha_inicio: Date;
    fecha_termino: Date;
  };
}) {
  const { id, nombre_campaña, entregas, fecha_inicio, fecha_termino } = item;
  const router = useRouter();

  const inicio = formatDate(fecha_inicio);
  const termino = formatDate(fecha_termino);

  const now = new Date();
  const estado = fecha_termino > now ? "En curso" : "Finalizado";

  const colorEstado =
    estado === "En curso"
      ? "bg-green-100 text-green-500 border-green-200"
      : "bg-slate-100 text-slate-500 border-slate-200";

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const handleClick = () => {
    router.push(`/dashboard/campanas/${id}`);
  };

  return (
    <tr
      onClick={handleClick}
      className="grid cursor-pointer grid-cols-26 gap-9 text-nowrap px-6 text-sm tabular-nums transition-colors hover:bg-slate-50"
    >
      <td className="group col-span-5 flex min-h-12 items-center py-4 text-slate-600">
        <div className="flex items-center gap-2">
          <div className="max-w-[160px] truncate">{id}</div>
          <div className="hidden rounded p-[3px] hover:bg-slate-200 group-hover:block">
            <TbCopy
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(id);
              }}
              className="h-5 w-5 shrink-0 cursor-pointer text-slate-500"
            />
          </div>
        </div>
      </td>
      <td className="col-span-7 flex items-center py-4 text-slate-600">
        {nombre_campaña}
      </td>
      <td className="col-span-3 py-4 text-left text-slate-600">
        <div className="flex items-center gap-3 font-medium text-slate-700/90">
          <div className="col-span-1 flex w-fit justify-start">
            <FiBox />
          </div>
          {entregas}
        </div>
      </td>
      <td className="col-span-3 flex justify-center py-4 text-slate-600">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${colorEstado}`}
        >
          {estado}
        </span>
      </td>
      <td className="col-span-4 py-4 text-right text-slate-600">{inicio}</td>
      <td className="col-span-4 py-4 text-right text-slate-600">{termino}</td>
    </tr>
  );
}
