import CampaignsTable from "@/app/ui/dashboard/campañas/campaigns-table";
import ActiveCampaigns from "@/app/ui/dashboard/campañas/active-campaigns";
import NewCampaignModal from "@/app/ui/dashboard/campañas/new-campaign-modal";
import CampaignsTableSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import NewCampaignButton from "@/app/ui/dashboard/campañas/new-campaign-button";
import Modal from "@/app/ui/dashboard/modal";
import { Suspense } from "react";
import SearchBar from "@/app/ui/dashboard/searchbar";

type CampaignsProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function Campaigns(props: CampaignsProps) {
  const searchParams = await props.searchParams;
  const modal = searchParams?.modal || "";
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div>
      {modal === "open" && (
        <Modal>
          <NewCampaignModal />
        </Modal>
      )}
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Campañas</h2>
          <p className="text-sm text-slate-600/70">
            Gestiona las campañas activas y accede al historial de cada una de
            ellas.
          </p>
        </div>
        <NewCampaignButton>Nueva Campaña</NewCampaignButton>
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <ActiveCampaigns />
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <span className="flex flex-wrap items-center gap-2 text-nowrap text-lg font-semibold text-slate-800">
              <p>Historial de Campañas</p>
            </span>
            <SearchBar placeholder="Buscar..." />
          </div>
          <Suspense fallback={<CampaignsTableSkeleton />}>
            <CampaignsTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
