"use client";
import { formatDate } from "@/app/lib/utils/format";
import { useRouter } from "next/navigation";
import { FiBox } from "react-icons/fi";
import { TbCopy } from "react-icons/tb";
import { toast } from "sonner";

export default function TableRow({
  item,
}: {
  item: {
    id: string;
    nombre_campaña: string;
    entregas: number | null;
    fecha_inicio: Date | null;
    fecha_termino: Date | null;
  };
}) {
  const { id, nombre_campaña, entregas, fecha_inicio, fecha_termino } = item;
  const router = useRouter();

  const inicio = formatDate(fecha_inicio);
  const termino = formatDate(fecha_termino);

  const now = new Date();
  const estado = fecha_termino
    ? fecha_termino > now
      ? "En curso"
      : "Finalizado"
    : "";

  const colorEstado =
    estado === "En curso"
      ? "bg-emerald-100/70 text-emerald-600 ring-emerald-600/5"
      : "bg-slate-100/70 text-slate-600 ring-slate-700/5";

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copiado al portapapeles");
  };

  const handleClick = () => {
    router.push(`/dashboard/campanas/${id}`);
  };

  return (
    <tr className="group grid min-w-[1000px] grid-cols-26 gap-4 text-nowrap px-5 text-sm transition-colors hover:bg-slate-50/80 md:px-6">
      {/* ID */}
      <td className="col-span-5 flex items-center py-4">
        <div className="relative flex items-center gap-2">
          <div
            onClick={handleClick}
            className="max-w-[160px] cursor-pointer truncate text-[13px] tabular-nums text-slate-500 transition-colors hover:text-blue-600 hover:underline"
          >
            {id}
          </div>
          <div className="absolute left-[110%] hidden rounded p-[3px] hover:bg-slate-200/70 sm:group-hover:block">
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
      {/* Nombre de la campaña */}
      <td className="col-span-7 flex items-center py-4">
        <p
          onClick={handleClick}
          className="cursor-pointer font-medium text-slate-600 hover:underline"
        >
          {nombre_campaña}
        </p>
      </td>
      {/* Entregas */}
      <td className="col-span-3 flex items-center gap-3 py-4 text-left text-slate-600">
        <FiBox className="col-span-1 flex w-fit justify-start" />
        {entregas ? entregas : 0}
      </td>
      {/* Estado */}
      <td className="col-span-3 flex items-center justify-center py-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${colorEstado}`}
        >
          {estado}
        </span>
      </td>
      {/* Fecha de inicio */}
      <td className="col-span-4 flex items-center justify-end py-4 text-right text-[13px] tabular-nums text-slate-600">
        {inicio}
      </td>
      {/* Fecha de término */}
      <td className="col-span-4 flex items-center justify-end py-4 text-right text-[13px] tabular-nums text-slate-600">
        {termino}
      </td>
    </tr>
  );
}
