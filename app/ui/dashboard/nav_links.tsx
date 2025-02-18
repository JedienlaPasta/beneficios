"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { nombre: "General", href: "/dashboard", icon: "" },
  { nombre: "Campañas", href: "/dashboard/campanas", icon: "" },
  { nombre: "Beneficiarios", href: "/dashboard/beneficiarios", icon: "" },
  { nombre: "RSH", href: "/dashboard/rsh", icon: "" },
  { nombre: "Registros", href: "/dashboard/registros", icon: "" },
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
          {/* <span>Icon</span> */}
          <p>{link.nombre}</p>
        </Link>
      ))}
    </ol>
  );
}
