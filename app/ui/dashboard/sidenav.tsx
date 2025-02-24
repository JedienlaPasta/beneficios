import NavLinks from "./nav_links";
import PerfilUsuario from "./perfil_usuario";
import Image from "next/image";

export default function Sidenav() {
  return (
    <div className="fixed flex h-dvh w-64 flex-col bg-[#171a1f] text-slate-300">
      <div className="flex h-16 items-center justify-center border-b border-slate-700/50 px-4">
        {/* <Image
          src="/logo.png"
          alt="Logo"
          width={120}
          height={32}
          className="h-8 w-auto"
        /> */}
      </div>

      <div className="flex flex-1 flex-col gap-6 px-4 py-6">
        <div className="flex flex-col gap-2">
          <p className="px-2 text-xs font-semibold tracking-wider text-slate-500">
            MENÚ PRINCIPAL
          </p>
          <NavLinks />
        </div>
      </div>

      <div className="border-t border-slate-700/50 px-4 py-4">
        <PerfilUsuario />
      </div>
    </div>
  );
}
