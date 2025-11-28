import { Suspense } from "react";
import UpdateCampaignModal from "@/app/ui/dashboard/campañas/[id]/update/update-campaign-modal";
import CampaignDetail from "@/app/ui/dashboard/campañas/[id]/campaign-detail";
import SearchBar from "@/app/ui/dashboard/searchbar";
import CampaignEntregasTable from "@/app/ui/dashboard/campañas/[id]/campaign-entregas-table";
import CampaignEntregasTableSkeleton from "@/app/ui/dashboard/campañas/[id]/table-skeleton";
import { Modal } from "@/app/ui/dashboard/modal";
import ModalSkeleton from "@/app/ui/modal-skeleton";
import ModalEntregasDetailContext from "@/app/ui/dashboard/entregas/[id]/modal-context";
import { CampaignDetailSkeleton } from "@/app/ui/dashboard/campañas/[id]/campaign-detail-skeleton";

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
        <Suspense fallback={<ModalSkeleton name="detailsModal" />}>
          <ModalEntregasDetailContext
            folio={detailsModal}
            rut={rut}
            isOnEditForJustification={justificationModal === "true"}
          />
        </Suspense>
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
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4 md:px-8 3xl:w-[96rem] 3xl:self-center">
            <span className="flex flex-wrap items-center gap-2 text-nowrap text-lg font-semibold text-slate-800">
              <p>Entregas de</p>
              <p className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-500">
                #{id}
              </p>
            </span>
            <SearchBar placeholder="Buscar..." />
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
