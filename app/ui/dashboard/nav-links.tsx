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

type NavLinksProps = {
  setSidenavOpen: (prev: boolean) => void;
};

export default function NavLinks({ setSidenavOpen }: NavLinksProps) {
  const pathname = usePathname();
  const splitPathname = pathname.split("/");
  const parentPathname =
    "/" + splitPathname[1] + (splitPathname[2] ? "/" + splitPathname[2] : "");

  return (
    <nav className="flex flex-col gap-1.5 py-2">
      {links.map((link) => {
        const isActive = parentPathname === link.href;

        return (
          <Link
            onClick={() => setSidenavOpen(false)}
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
              <div className="absolute left-full z-50 ml-3 hidden text-nowrap rounded-lg bg-slate-700 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 lg:group-hover:block">
                {link.description}
                <div className="absolute -left-1 top-1/2 z-10 h-2 w-2 -translate-y-1/2 rotate-45 bg-slate-700" />
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
