"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaHouseChimney } from "react-icons/fa6";
import { MdKeyboardArrowRight } from "react-icons/md";

export default function Breadcrumbs() {
  const router = useRouter();
  const pathname = usePathname();

  const getBreadCrumbs = () => {
    const breadCrumbsPaths = pathname.split("/").filter(Boolean);
    const breadCrumbs = breadCrumbsPaths.map((path) => {
      if (path === "dashboard") return [path, "Inicio"];
      if (path === "campanas") return [path, "Campañas"];
      if (path === "entregas") return [path, "Entregas"];
      if (path === "rsh") return [path, "RSH"];
      if (path === "auditoria") return [path, "Auditoría"];
      if (path === "usuarios") return [path, "Usuarios"];
      else return [path, path];
    });
    return breadCrumbs;
  };

  const breadCrumbs = getBreadCrumbs();

  const getPath = (index: number) => {
    let path = "";
    for (let i = 0; i < index + 1; i++) {
      path += "/" + breadCrumbs[i][0];
    }
    router.push(path);
  };

  return (
    <nav
      aria-label="breadcrumb"
      className="flex h-full items-center justify-between"
    >
      <ol className="flex text-sm text-gray-400">
        {breadCrumbs.map((item, index) => (
          <li key={index} className="flex items-center">
            <button
              onClick={() => getPath(index)}
              className={`h-6 rounded-md px-2 transition-all hover:bg-gray-300 hover:text-slate-600 ${breadCrumbs.length - 1 === index && "text-slate-700"}`}
            >
              {index === 0 ? <FaHouseChimney /> : item[1]}
            </button>
            {index < breadCrumbs.length - 1 && (
              <span className="mx-1 text-lg">
                <MdKeyboardArrowRight />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
