import CampaignsTable from "@/app/ui/dashboard/campañas/campaigns-table";
import ActiveCampaigns from "@/app/ui/dashboard/campañas/active-campaigns";
import NewCampaignModal from "@/app/ui/dashboard/campañas/new-campaign-modal";
import CampaignsTableSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import NewCampaignButton from "@/app/ui/dashboard/campañas/new-campaign-button";
import Modal from "@/app/ui/dashboard/modal";
import { Suspense } from "react";
import TableHeader from "@/app/ui/dashboard/table-header";

type CampaignsProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function Campaigns(props: CampaignsProps) {
  const searchParams = await props.searchParams;
  const modal = searchParams?.modal || "";
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div className="h-fit w-full px-6 py-8 text-slate-900 lg:px-10">
      {modal === "open" && (
        <Modal>
          <NewCampaignModal />
        </Modal>
      )}
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Campañas</h2>
          <p className="text-sm text-slate-600/70">
            Gestionar campañas activas y historial de campañas.
          </p>
        </div>
        <NewCampaignButton>Nueva Campaña</NewCampaignButton>
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <ActiveCampaigns />
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <TableHeader>
            <p>Historial de Campañas</p>
          </TableHeader>
          <Suspense fallback={<CampaignsTableSkeleton />}>
            <CampaignsTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
