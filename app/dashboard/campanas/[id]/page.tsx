import Buscar from "@/app/ui/dashboard/searchbar";
import Detalle from "@/app/ui/dashboard/campañas/detalle-campaña";
import NuevaCampañaModal from "@/app/ui/dashboard/campañas/new-campaign-modal";
import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import TablaEntregasDetalleCampaña from "@/app/ui/dashboard/campañas/campaign-social-aid-table";
import Modal from "@/app/ui/dashboard/modal";
import { Suspense } from "react";
import { Toaster } from "sonner";

type DetalleCampañaProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    modal?: string;
  }>;
  params: Promise<{ id: string }>;
};

export default async function DetalleCampaña(props: DetalleCampañaProps) {
  // Search params (query, page, modal)
  const searchParams = await props.searchParams;
  const modal = searchParams?.modal || "";
  const query = searchParams?.query || "";
  const paginaActual = Number(searchParams?.page) || 1;
  // const busqueda = searchParams?.query || "";
  // Params (id)
  const params = await props.params;
  const id = params.id;

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
        <Detalle id={id} />
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
            <TablaEntregasDetalleCampaña
              id={id}
              query={query}
              paginaActual={paginaActual}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
