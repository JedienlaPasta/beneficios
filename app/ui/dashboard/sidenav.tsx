import Image from "next/image";
import { anton_sc } from "../fonts";
import NavLinks from "./nav-links";
import PerfilUsuario from "./perfil-usuario";
import img from "@/public/logo_S.svg";

type SidenavProps = {
  setSidenavOpen: (prev: boolean) => void;
};

export default function Sidenav({ setSidenavOpen }: SidenavProps) {
  return (
    <div className="sidenav-wrapper">
      <div className="z-0 w-72"></div>
      <div className="fixed z-20 flex h-dvh w-72 flex-col bg-[#171a1f] text-slate-300">
        <div className="flex h-16 items-center gap-2 border-b border-slate-700/50 px-4">
          <span
            className={`${anton_sc.className} flex items-center gap-0.5 text-3xl font-bold text-slate-100`}
          >
            <Image width={40} height={40} alt="logo" src={img}></Image>
            {/* <p className="text-4xl text-blue-500">S</p> */}
            <p className="text-3xl tracking-wider">IBAS</p>
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-6 px-4 py-6">
          <div className="flex flex-col gap-2">
            <p className="px-2 text-xs font-semibold tracking-wider text-slate-500">
              MENÚ PRINCIPAL
            </p>
            <NavLinks setSidenavOpen={setSidenavOpen} />
          </div>
        </div>

        <div className="border-t border-slate-700/50 px-4 py-4">
          <PerfilUsuario />
        </div>
      </div>
    </div>
  );
}
