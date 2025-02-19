import NavLinks from "./nav_links";
import PerfilUsuario from "./perfil_usuario";

export default function Sidenav() {
  return (
    <div className="fixed flex h-dvh w-60 shrink-0 flex-col border-r border-gray-900/10 bg-slate-800 text-slate-900">
      <div className="mx-4 mt-4 h-16 justify-center rounded-md bg-slate-100/10"></div>
      {/* <PerfilUsuario /> */}
      <section className="mx-4 my-4 flex flex-grow flex-col">
        <p className="mx-1 text-[10px] font-bold text-slate-500">
          MENÚ PRINCIPAL
        </p>
        <NavLinks />
      </section>
      <div>
        <PerfilUsuario />
      </div>
    </div>
  );
}
