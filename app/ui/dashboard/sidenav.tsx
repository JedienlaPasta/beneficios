import NavLinks from "./nav-links";
import PerfilUsuario from "./perfil-usuario";

export default function Sidenav() {
  return (
    <div className="fixed flex h-dvh w-72 flex-col bg-[#171a1f] text-slate-300">
      <div className="flex h-16 items-center gap-2 border-b border-slate-700/50 px-4">
        <div className="h-6 w-3 rounded bg-gradient-to-r from-blue-400 to-blue-500"></div>
        <p className="text-xl font-bold tracking-wider text-slate-100">
          ApoyoFacil
        </p>
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
