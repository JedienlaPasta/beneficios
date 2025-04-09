"use client";
import { RiDashboardFill } from "react-icons/ri";
import { FaBoxesStacked } from "react-icons/fa6";
import { FaBoxOpen } from "react-icons/fa6";
import { FaHouseChimney } from "react-icons/fa6";
import { FaFileLines } from "react-icons/fa6";
import { FaUserGear } from "react-icons/fa6";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import RoleGuard from "../auth/role-guard";

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
    nombre: "Auditoría",
    href: "/dashboard/auditoria",
    icon: <FaFileLines className="h-5 w-5" />,
  },
  {
    nombre: "Usuarios",
    href: "/dashboard/usuarios",
    icon: <FaUserGear className="h-5 w-5" />,
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

        // For admin-only links
        if (link.nombre === "Auditoría" || link.nombre === "Usuarios") {
          return (
            <RoleGuard key={link.nombre} allowedRoles={["Administrador"]}>
              <Link
                onClick={() => setSidenavOpen(false)}
                href={link.href}
                prefetch={true}
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
              </Link>
            </RoleGuard>
          );
        }

        // For regular links visible to all users
        return (
          <Link
            onClick={() => setSidenavOpen(false)}
            key={link.nombre}
            href={link.href}
            prefetch={true}
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
          </Link>
        );
      })}
    </nav>
  );
}
