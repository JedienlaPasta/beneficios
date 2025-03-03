import DatosGenerales from "@/app/ui/dashboard/inicio/datos-generales";
import TableroEntregasInicio from "@/app/ui/dashboard/inicio/entregas-inicio";
import { Suspense } from "react";
import TablaActividades from "@/app/ui/dashboard/inicio/tabla-actividades";
import Buscar from "@/app/ui/dashboard/buscar";
import TablaActividadesSkeleton from "@/app/ui/dashboard/inicio/tabla-actividades-skeleton";

type InicioProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function DashboardPage(props: InicioProps) {
  const searchParams = await props.searchParams;
  // const modal = searchParams?.modal || "";
  const busqueda = searchParams?.query || "";
  const paginaActual = Number(searchParams?.page) || 1;

  return (
    <div className="h-fit w-full px-6 py-8 text-slate-900 lg:px-10">
      {/* {abrirModal && <NuevaCampañaModal closeModal={toggleModal} />} */}
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Inicio</h2>
          <p className="text-sm text-slate-600/70">
            Datos generales y actividades personales.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 overflow-hidden rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <DatosGenerales />
        <div className="items-centers w-fits flex flex-col justify-center gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-white px-10 py-4 shadow-sm">
          <h2 className="my-2 text-lg font-semibold text-slate-800">
            Entregas Realizadas
          </h2>
          <TableroEntregasInicio />
          <div className="flex w-fit flex-nowrap justify-end gap-1 self-start rounded-lg border border-slate-200 px-2 py-1">
            <p className="text-xs text-slate-400">Poco</p>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-slate-200 bg-slate-100"></div>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-300 bg-green-100"></div>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-400 bg-green-200"></div>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-500 bg-green-300"></div>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-600 bg-green-400"></div>
            <p className="text-xs text-slate-400">Mucho</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Tus Actividades
            </h2>
            <Buscar placeholder="Buscar..." />
          </div>
          <Suspense fallback={<TablaActividadesSkeleton />}>
            <TablaActividades busqueda={busqueda} paginaActual={paginaActual} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
