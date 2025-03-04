import { RiDonutChartFill } from "react-icons/ri";
import { FiBox } from "react-icons/fi";
import { FaRegCalendar } from "react-icons/fa6";
import { LuCalendarCheck } from "react-icons/lu";
import { JSX } from "react";
import Link from "next/link";
import { BiEdit, BiTrash } from "react-icons/bi";

export default async function Detalle({ id }: { id: string }) {
  return (
    <div className="items-centers relative flex flex-col justify-center">
      <div className="grid gap-4 rounded-xl border border-gray-200 bg-slate-50 p-6">
        <div className="absolute right-6 top-6 flex gap-3">
          <CrudButton to={`/dashboard/campanas/${id}/edit`} />
          <CrudButton />
        </div>
        <span className="flex items-center gap-1">
          <p className="font-medium text-slate-800">Folio</p>
          <p className="text-sm font-medium text-blue-500">#CAM-01-25-GA</p>
        </span>
        <span className="flex items-center gap-2">
          <span className="rounded-md bg-teal-600 p-[6px] text-sm text-white">
            GA
          </span>
          <p className="text-lg font-medium tracking-tight text-slate-800">
            Vale de Gas
          </p>
        </span>
        <div className="mt-2 flex flex-wrap gap-5">
          <Card name="Estado" value="En curso" icon={<RiDonutChartFill />} />
          <Card name="Entregas" value="24" icon={<FiBox />} />
          <Card
            name="Fecha Inicio"
            value="2 Mar, 2025"
            icon={<FaRegCalendar />}
          />
          <Card
            name="Fecha Término"
            value=" 23 Mar, 2025"
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
  const colors = [
    ["Estado", "text-green-400"],
    ["Entregas", "text-blue-500"],
    ["Fecha Inicio", "text-slate-700"],
    ["Fecha Término", "text-red-600"],
  ];

  const iconColor = colors.find((item) => item?.includes(name));

  return (
    <div className="relative flex w-60 grow flex-col rounded-md bg-gray-200 px-6 py-5">
      <p className="text-xs uppercase tracking-wider text-slate-400">{name}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <span
        className={`absolute right-6 top-5 text-xl ${iconColor && iconColor[1]}`}
      >
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
