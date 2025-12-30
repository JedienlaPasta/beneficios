import CampaignsTable from "@/app/ui/dashboard/campañas/CampaignsTable";
import ActiveCampaigns, {
  ActiveCampaignsSkeleton,
} from "@/app/ui/dashboard/campañas/ActiveCampaigns";
import NewCampaignModal from "@/app/ui/dashboard/campañas/new-campaign-modal/NewCampaignModal";
import CampaignsTableSkeleton from "@/app/ui/dashboard/campañas/CampaignsTableSkeleton";
import NewCampaignButton from "@/app/ui/dashboard/campañas/NewCampaignButton";
import { Suspense } from "react";
import SearchBar from "@/app/ui/dashboard/searchbar";
import { Modal } from "@/app/ui/dashboard/modal";
import { Package2 } from "lucide-react";

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
        <Modal name="modal">
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
        <Suspense fallback={<ActiveCampaignsSkeleton />}>
          <ActiveCampaigns />
        </Suspense>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 md:px-6 3xl:w-[96rem] 3xl:self-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-inset ring-blue-700/10">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Campañas Registradas
                </h2>
                <p className="-mt-0.5 text-xs font-medium text-slate-500">
                  Historial completo de campañas
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchBar placeholder="Buscar..." />
            </div>
          </div>
          <Suspense fallback={<CampaignsTableSkeleton />}>
            <CampaignsTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
