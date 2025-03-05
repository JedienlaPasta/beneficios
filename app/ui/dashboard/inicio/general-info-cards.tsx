import { HiOutlineGift } from "react-icons/hi2";
import { HiOutlineUsers } from "react-icons/hi2";
// import { HiOutlineClock } from "react-icons/hi2";

export default function GeneralInfoCards() {
  const stats = [
    {
      title: "Campañas Activas",
      value: "4",
      icon: <HiOutlineGift className="h-5 w-5" />,
      change: "+2 este mes",
      changeType: "positive",
    },
    {
      title: "Entregas",
      value: "98",
      icon: <HiOutlineUsers className="h-5 w-5" />,
      change: "+31 última semana",
      changeType: "positive",
    },
    {
      title: "Beneficiarios",
      value: "1.429",
      icon: <HiOutlineUsers className="h-5 w-5" />,
      change: "+0 última semana",
      changeType: "positive",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md shadow-slate-300 transition-all hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                {stat.icon}
              </div>
              <p className="text-sm font-medium text-slate-600">{stat.title}</p>
            </div>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">
              {stat.value}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                stat.changeType === "positive"
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {stat.change}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      ))}
    </div>
  );
}
