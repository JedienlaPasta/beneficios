import Image from "next/image";
import { anton_sc } from "../fonts";
import NavLinks from "./nav-links";
import PerfilUsuario from "./perfil-usuario";
import elquiscoImg from "@/public/elquisco.svg";
import { UserData } from "@/app/lib/definitions";
import SibasLogo from "./sibas-logo";

type SidenavProps = {
  setSidenavOpen: (prev: boolean) => void;
  userData: UserData;
};

export default function Sidenav({ setSidenavOpen, userData }: SidenavProps) {
  return (
    <div className="z-20 flex min-h-screen w-72 flex-col bg-[#171a1f] text-slate-300">
      <div className="flex h-20 min-h-[5rem] shrink-0 items-center border-b border-slate-700/50 px-4">
        <SibasLogo />
      </div>

      {/* Scrollable section */}
      <div className="flex h-[calc(100vh-5rem)] overflow-hidden">
        <div className="flex flex-1 flex-col justify-between overflow-y-auto">
          <div className="flex flex-col gap-6 px-4 py-6">
            <div className="flex flex-col gap-2">
              <p className="px-2 text-xs font-semibold tracking-wider text-slate-500">
                MENÚ PRINCIPAL
              </p>
              <NavLinks setSidenavOpen={setSidenavOpen} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 border-t border-slate-700/50 px-4 py-3">
              <Image
                width={60}
                loading="lazy"
                alt="El Quisco logo"
                src={elquiscoImg}
                className="object-contain"
              />
              <div
                className={`${anton_sc.className} flex flex-col text-sm leading-tight text-slate-200`}
              >
                <p className="text-blue-500">MUNICIPALIDAD</p>
                <p>EL QUISCO</p>
              </div>
            </div>

            <div className="border-t border-slate-700/50 px-4 py-4">
              <PerfilUsuario userData={userData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
