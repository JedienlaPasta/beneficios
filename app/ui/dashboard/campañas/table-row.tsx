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
    nombre: string;
    entregas: number;
    estado: "En curso" | "Finalizado";
    fecha_inicio: Date;
    fecha_termino: Date;
  };
}) {
  const { id, nombre, entregas, fecha_inicio, fecha_termino } = item;
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
      className="cursor-pointer text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50"
    >
      <td className="group w-[20%] max-w-56 px-10 py-3 font-medium text-slate-700">
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
      <td className="w-[30%] py-3 font-medium text-slate-700">{nombre}</td>
      <td className="w-[10%] items-center py-3 text-slate-700">
        <div className="flex items-center gap-3 font-medium text-slate-700/90">
          <div className="col-span-1 flex w-fit justify-start">
            <FiBox />
          </div>
          {entregas}
        </div>
      </td>
      <td className="w-[5%] py-3">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${colorEstado}`}
        >
          {estado}
        </span>
      </td>
      <td className="w-[15%] py-3 text-right text-slate-600">{inicio}</td>
      <td className="w-[15%] px-10 py-3 text-right text-slate-600">
        {termino}
      </td>
    </tr>
  );
}
