import NavLinks from "./nav_links";

export default function Sidenav() {
  return (
    <div className="flex flex-col w-64 text-slate-900 bg-white border-r h-dvh border-slate-900/15">
      <section className="mx-4 my-20">
        <p className="text-[10px] mx-1 text-slate-900/60 font-bold">
          MENÚ PRINCIPAL
        </p>
        <NavLinks />
      </section>
    </div>
  );
}
