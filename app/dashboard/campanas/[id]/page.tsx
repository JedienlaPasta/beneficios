import { Suspense } from "react";
import UpdateCampaignModal from "@/app/ui/dashboard/campañas/[id]/update/UpdateCampaignModal";
import CampaignDetail from "@/app/ui/dashboard/campañas/[id]/CampaignDetail";
import SearchBar from "@/app/ui/dashboard/Searchbar";
import CampaignEntregasTable from "@/app/ui/dashboard/campañas/[id]/CampaignEntregasTable";
import CampaignEntregasTableSkeleton from "@/app/ui/dashboard/campañas/[id]/TableSkeleton";
import { Modal } from "@/app/ui/dashboard/Modal";
import ModalSkeleton from "@/app/ui/modal-skeleton";
import ModalEntregasDetailContext from "@/app/ui/dashboard/entregas/[id]/detail-modal/ModalContext";
import { CampaignDetailSkeleton } from "@/app/ui/dashboard/campañas/[id]/CampaignDetailSkeleton";
import { Package2 } from "lucide-react";

type CampaignProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    update?: string;
    detailsModal?: string;
    rut?: string;
    justification?: string;
  }>;
  params: Promise<{ id: string }>;
};

export default async function Campaign(props: CampaignProps) {
  // Search params (query, page, modal)
  const searchParams = await props.searchParams;
  const showUpdateModal = searchParams?.update || "";
  const detailsModal = searchParams?.detailsModal || "";
  const justificationModal = searchParams?.justification || "";

  const rut = searchParams?.rut || "";
  const query = searchParams?.query || "";
  const paginaActual = Number(searchParams?.page) || 1;
  // Params (id)
  const params = await props.params;
  const id = params.id;

  return (
    <div>
      {showUpdateModal === "open" && (
        <Modal name="update">
          <Suspense fallback={<ModalSkeleton name="update" />}>
            <UpdateCampaignModal id={id} />
          </Suspense>
        </Modal>
      )}

      {detailsModal && (
        <Modal name="detailsModal">
          <Suspense fallback={<ModalSkeleton name="detailsModal" />}>
            <ModalEntregasDetailContext
              folio={detailsModal}
              rut={rut}
              isOnEditForJustification={justificationModal === "true"}
            />
          </Suspense>
        </Modal>
      )}
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Detalle Campaña</h2>
          <p className="text-sm text-slate-600/70">
            Gestionar datos de campaña y sus entregas asociadas.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <Suspense fallback={<CampaignDetailSkeleton />}>
          <CampaignDetail id={id} />
        </Suspense>
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 md:px-6 3xl:w-[96rem] 3xl:self-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-inset ring-blue-700/10">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Beneficios Entregados
                </h2>
                <p className="-mt-0.5 text-xs font-medium text-slate-500">
                  Historial completo de beneficios
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchBar placeholder="Buscar..." />
            </div>
          </div>
          <Suspense fallback={<CampaignEntregasTableSkeleton />}>
            <CampaignEntregasTable
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
