import { RiDonutChartFill } from "react-icons/ri";
import { FiBox } from "react-icons/fi";
import { FaRegCalendar } from "react-icons/fa6";
import { LuCalendarCheck } from "react-icons/lu";
import { JSX } from "react";
import Link from "next/link";
import { BiEdit, BiTrash } from "react-icons/bi";
import { fetchCampaignById } from "@/app/lib/data";
import { Campaña } from "@/app/lib/definitions";
import { formatearFecha } from "@/app/lib/utils";

export default async function Detalle({ id }: { id: string }) {
  const { data } = (await fetchCampaignById(id)) as { data: Campaña[] };
  // if (!data) {
  //   return <p>No se encontró la campaña</p>;
  // }
  const { nombre, fecha_inicio, fecha_termino, descripcion, estado, entregas } =
    data[0];
  const inicio = formatearFecha(fecha_inicio);
  const termino = formatearFecha(fecha_termino);

  return (
    <div className="items-centers relative flex flex-col justify-center">
      <div className="grid gap-2 rounded-xl border border-gray-200 bg-white p-6">
        <div className="absolute right-6 top-6 flex gap-3">
          <CrudButton to={`/dashboard/campanas/${id}/edit`} />
          <CrudButton />
        </div>
        <span className="flex items-center gap-1">
          <p className="font-medium text-slate-800">ID</p>
          <p className="text-sm font-medium text-blue-500">#{id}</p>
        </span>
        <span className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500 text-sm text-white">
            {descripcion}
          </span>
          <p className="text-lg font-medium tracking-tight text-slate-800">
            {nombre}
          </p>
        </span>
        <div className="mt-3 flex flex-wrap gap-5">
          <Card name="Estado" value={estado} icon={<RiDonutChartFill />} />
          <Card name="Entregas" value={entregas.toString()} icon={<FiBox />} />
          <Card name="Fecha Inicio" value={inicio} icon={<FaRegCalendar />} />
          <Card
            name="Fecha Término"
            value={termino}
            icon={<LuCalendarCheck />}
          />
        </div>
      </div>
    </div>
  );
}

function Card({
  name,
  value,
  icon,
}: {
  name: string;
  value: string;
  icon: JSX.Element;
}) {
  const iconsColor = [
    ["Estado", "text-green-400", "text-red-400"],
    ["Entregas", "text-blue-500"],
    ["Fecha Inicio", "text-slate-600"],
    ["Fecha Término", "text-red-400"],
  ];

  const iconValues = iconsColor.find((item) => item?.includes(name));
  let iconColor;
  if (value === "Finalizado" && iconValues) {
    iconColor = iconValues[2];
  } else if (iconValues) {
    iconColor = iconValues[1];
  }

  return (
    <div className="relative flex w-60 grow flex-col rounded-md border border-gray-100 bg-slate-100 px-6 py-5">
      <p className="text-xs uppercase tracking-wider text-slate-400">{name}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <span className={`absolute right-6 top-5 text-xl ${iconColor}`}>
        {icon}
      </span>
    </div>
  );
}

function CrudButton({ to }: { to?: string }) {
  const buttonStyle =
    "text-xl rounded-md bg-slate-200 p-1 h-7 w-7 hover:bg-slate-300 cursor-pointer";
  if (to) {
    return (
      <Link href={to}>
        <BiEdit className={buttonStyle} />
      </Link>
    );
  }
  return <BiTrash className={buttonStyle} />;
}
