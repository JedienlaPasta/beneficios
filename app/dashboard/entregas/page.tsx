import TablaCampañas from "@/app/ui/dashboard/campañas/tabla-campañas";
import CampañasActivas from "@/app/ui/dashboard/campañas/campañas-activas";
import Buscar from "@/app/ui/dashboard/buscar";
import { Suspense } from "react";
import NuevaCampañaModal from "@/app/ui/dashboard/campañas/nueva-campaña-modal";
import Modal from "@/app/ui/dashboard/modal";
import NuevaCampañaButton from "@/app/ui/dashboard/nuevo-registro-button";
import { Toaster } from "sonner";
import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/tabla-campañas-skeleton";

type EntregasProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function Entregas(props: EntregasProps) {
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
          <h2 className="text-3xl font-bold text-slate-800">Entregas</h2>
          <p className="text-sm text-slate-600/70">
            Evaluar y gestionar la entrega de beneficios.
          </p>
        </div>
        <NuevaCampañaButton>Registrar Entrega</NuevaCampañaButton>
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <CampañasActivas />
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Historial de Campañas
            </h2>
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
