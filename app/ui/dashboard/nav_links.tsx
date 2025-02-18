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
  { nombre: "Inicio", href: "/dashboard", icon: <RiDashboardFill /> },
  { nombre: "Campañas", href: "/dashboard/campanas", icon: <FaBoxesStacked /> },
  { nombre: "Entregas", href: "/dashboard/entregas", icon: <FaBoxOpen /> },
  { nombre: "RSH", href: "/dashboard/rsh", icon: <FaHouseChimney /> },
  { nombre: "Registros", href: "/dashboard/registros", icon: <FaFileExcel /> },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <ol className="flex flex-col gap-1 py-1 text-slate-900/70">
      {links.map((link) => (
        <Link
          key={link.nombre}
          href={link.href}
          className={clsx(
            "flex items-center gap-2 px-2 py-2 rounded-md text-sm",
            {
              "bg-slate-800 text-slate-200": pathname === link.href,
            }
          )}
        >
          {link.icon}
          <p>{link.nombre}</p>
        </Link>
      ))}
    </ol>
  );
}
