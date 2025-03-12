import TablaCampañas from "@/app/ui/dashboard/campañas/campaigns-table";
import CampañasActivas from "@/app/ui/dashboard/campañas/active-campaigns";
import SearchBar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import NewCampaignModal from "@/app/ui/dashboard/campañas/new-campaign-modal";
import Modal from "@/app/ui/dashboard/modal";
import NewCampaignButton from "@/app/ui/dashboard/campañas/new-campaign-button";
import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import RSHGeneralInfo from "@/app/ui/dashboard/rsh/general-info";

type RSHProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function RSH(props: RSHProps) {
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
      <div className="mb-6 flex flex-col justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <h2 className="text-3xl font-bold text-slate-800">
          Registro Social de Hogares
        </h2>
        <p className="text-sm text-slate-600/70">
          Gestionar registros de ciudadanos con RSH.
        </p>
      </div>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <RSHGeneralInfo />
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Historial de Campañas
            </h2>
            <SearchBar placeholder="Buscar campaña..." />
          </div>
          <Suspense fallback={<TablaCampañasSkeleton />}>
            <TablaCampañas query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
