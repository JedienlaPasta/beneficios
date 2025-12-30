import { FaBoxesStacked } from "react-icons/fa6";
import { FaPersonCane } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa6";
import Link from "next/link";
import { fetchGeneralInfo } from "@/app/lib/data/inicio";
import { formatNumber } from "@/app/lib/utils/format";
import { JSX } from "react";

export default async function GeneralInfoCards() {
  const response = await fetchGeneralInfo();
  const stats = [
    {
      title: "Campañas Activas",
      value: formatNumber(response.active_campaigns) || "4",
      icon: <FaBoxesStacked className="h-5 w-5" />,
      to: "/dashboard/campanas",
      changeType: "positive",
    },
    {
      title: "Entregas",
      value: formatNumber(response.total_entregas) || "98",
      icon: <FaBoxOpen className="h-5 w-5" />,
      to: "/dashboard/entregas",
      changeType: "positive",
    },
    {
      title: "Beneficiarios",
      value: formatNumber(response.total_beneficiarios) || "1.429",
      icon: <FaPersonCane className="h-5 w-5" />,
      to: "/dashboard/rsh",
      changeType: "positive",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
      {stats.map((stat) => (
        <InfoCard key={stat.title} stat={stat} />
      ))}
    </div>
  );
}

type InfoCardProps = {
  stat: {
    title: string;
    value: string;
    icon: JSX.Element;
    changeType: string;
    to: string;
  };
};

function InfoCard({ stat }: InfoCardProps) {
  return (
    <Link
      key={stat.title}
      href={stat.to}
      className="group cursor-pointer overflow-hidden rounded-xl bg-white p-6 shadow-md shadow-slate-300/70 transition-all duration-300 hover:shadow-lg hover:shadow-slate-300/80 last:lg:col-span-2 last:2xl:col-span-1"
    >
      {/* Card header with icon and title */}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-10 place-content-center place-items-center rounded-lg bg-blue-500/20 text-blue-600 shadow-sm transition-all group-hover:bg-blue-500/25">
            {stat.icon}
          </div>
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {stat.title}
          </p>
        </div>
        <div className="">
          <span className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            {stat.value}
          </span>
        </div>
        <div className="absolute right-0 top-1/2 h-16 w-24 -translate-y-1/2 translate-x-[7rem] rounded-lg bg-blue-500 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>
    </Link>
  );
}
