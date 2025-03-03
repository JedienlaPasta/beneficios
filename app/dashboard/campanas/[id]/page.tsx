import Buscar from "@/app/ui/dashboard/buscar";
import Detalle from "@/app/ui/dashboard/campañas/detalle-campaña";
import NuevaCampañaModal from "@/app/ui/dashboard/campañas/nueva-campaña-modal";
import TablaCampañas from "@/app/ui/dashboard/campañas/tabla-campañas";
import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/tabla-campañas-skeleton";
import Modal from "@/app/ui/dashboard/modal";
import { Suspense } from "react";
import { Toaster } from "sonner";

type ActualizarCampañaProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function DetalleCampaña(props: ActualizarCampañaProps) {
  const searchParams = await props.searchParams;
  const modal = searchParams?.modal || "";
  const busqueda = searchParams?.query || "";
  const paginaActual = Number(searchParams?.page) || 1;

  return (
    <div className="h-fit w-full px-6 py-8 text-slate-900 lg:px-10">
      {modal === "open" && (
        <Modal>
          <NuevaCampañaModal />
        </Modal>
      )}
      <Toaster />
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Detalle Campaña</h2>
          <p className="text-sm text-slate-600/70">
            Gestionar datos de campaña y sus entregas asociadas.
          </p>
        </div>
        {/* <NuevaCampañaButton>Nueva Campaña</NuevaCampañaButton> */}
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <Detalle />
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-800">
                Entregas de
              </h2>
              <span className="text-sm font-medium text-blue-500">
                #CAM-01-25-GA
              </span>
            </div>
            <Buscar placeholder="Buscar campaña..." />
          </div>
          <Suspense fallback={<TablaCampañasSkeleton />}>
            <TablaCampañas busqueda={busqueda} paginaActual={paginaActual} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
