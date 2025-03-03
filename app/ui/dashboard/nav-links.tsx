"use client";

import { RiDashboardFill } from "react-icons/ri";
import { FaBoxesStacked } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa6";
import { FaHouseChimney } from "react-icons/fa6";
import { FaFileExcel } from "react-icons/fa6";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    nombre: "Inicio",
    href: "/dashboard",
    icon: <RiDashboardFill className="h-5 w-5" />,
  },
  {
    nombre: "Campañas",
    href: "/dashboard/campanas",
    icon: <FaBoxesStacked className="h-5 w-5" />,
  },
  {
    nombre: "Entregas",
    href: "/dashboard/entregas",
    icon: <FaBoxOpen className="h-5 w-5" />,
  },
  {
    nombre: "RSH",
    href: "/dashboard/rsh",
    icon: <FaHouseChimney className="h-5 w-5" />,
    description: "Registro Social de Hogares",
  },
  {
    nombre: "Registros",
    href: "/dashboard/registros",
    icon: <FaFileExcel className="h-5 w-5" />,
  },
];
export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1.5 py-2">
      {links.map((link) => {
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.nombre}
            href={link.href}
            className={clsx(
              "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              {
                "bg-gradient-to-r from-blue-500 to-blue-600 text-white":
                  isActive,
                "text-slate-400 hover:bg-slate-800/70 hover:text-white hover:shadow-sm":
                  !isActive,
              },
            )}
          >
            <span
              className={clsx("transition-all duration-200", {
                "scale-110 transform text-white": isActive,
                "text-slate-400 group-hover:text-white": !isActive,
              })}
            >
              {link.icon}
            </span>
            <span
              className={clsx({
                "text-white": isActive,
                "text-slate-400 group-hover:text-white": !isActive,
              })}
            >
              {link.nombre}
            </span>

            {link.description && (
              <div className="absolute left-full ml-3 hidden rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 lg:group-hover:block">
                {link.description}
                <div className="absolute -left-1 top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-700" />
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
