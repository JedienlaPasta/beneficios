import TablaDatosDashboard from "@/app/ui/dashboard/tabla-datos-dashboard";
import CampañasActivas from "@/app/ui/dashboard/campañas/campañas-activas";
import { IoCardOutline, IoTicketOutline } from "react-icons/io5";
import { TbDiaper } from "react-icons/tb";
import Buscar from "@/app/ui/dashboard/buscar";
import { Suspense } from "react";
export default async function Campanas(props: {
  searchParams?: Promise<{ query?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const busqueda = searchParams?.query || "";
  const paginaActual = Number(searchParams?.page) || 1;

  return (
    <div className="w-full px-6 py-8 text-slate-900 lg:px-10">
      {/* {abrirModal && <NuevaCampañaModal closeModal={toggleModal} />} */}
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Campañas</h2>
          <p className="text-sm text-slate-600/70">
            Gestionar campañas activas y historial de campañas.
          </p>
        </div>
        <button
          // onClick={toggleModal}
          className="flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-blue-600 active:scale-95"
        >
          <span className="text-lg">+</span> Nueva Campaña
        </button>
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <div className="flex gap-4">
          <CampañasActivas
            nombre="Vale de Gas"
            termina="27 Abr, 2025"
            icono={<IoTicketOutline className="text-4xl" />}
          />
          <CampañasActivas
            nombre="Tarjeta de Comida"
            termina="04 Jun, 2025"
            icono={<IoCardOutline className="text-4xl" />}
          />
          <CampañasActivas
            nombre="Pañales"
            termina="12 Sep, 2025"
            icono={<TbDiaper className="text-4xl" />}
          />
        </div>
        <div className="flex flex-col gap-4 rounded-xl bg-slate-50">
          <div className="flex items-center justify-between px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Historial de Campañas
            </h2>
            <Buscar placeholder="Buscar campaña..." />
          </div>
          <Suspense fallback={<div>Cargando...</div>}>
            <TablaDatosDashboard
              busqueda={busqueda}
              paginaActual={paginaActual}
            />
          </Suspense>
          {/* <Pagination totalPaginas={totalPaginas} /> */}
        </div>
      </div>
    </div>
  );
}
