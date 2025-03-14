import { Suspense } from "react";
import NewCampaignModal from "@/app/ui/dashboard/campañas/new-campaign-modal";
import Modal from "@/app/ui/dashboard/modal";
import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import RSHGeneralInfo from "@/app/ui/dashboard/rsh/general-info";
import RSHTable from "@/app/ui/dashboard/rsh/rsh-table";
import TableHeader from "@/app/ui/dashboard/table-header";
import { fetchRSHInfo } from "@/app/lib/data/rsh";
import ImportXLSXModal from "@/app/ui/dashboard/rsh/import-xlsx-modal";
import ProtectedRoute from "@/app/dashboard/ProtectedRoute";

type RSHProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    newcitizen?: string;
    importxlsx?: string;
  }>;
};

export default async function RSH(props: RSHProps) {
  const searchParams = await props.searchParams;
  const newcitizen = searchParams?.newcitizen || "";
  const importxlsx = searchParams?.importxlsx || "";
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  const { data } = await fetchRSHInfo();

  return (
    <ProtectedRoute isDashboardRoute={true}>
      <div className="h-fit w-full px-6 py-8 text-slate-900 lg:px-10">
        {newcitizen === "open" && (
          <Modal>
            <NewCampaignModal />
          </Modal>
        )}
        {importxlsx === "open" && (
          <Modal>
            <ImportXLSXModal />
          </Modal>
        )}
        <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              Registro Social de Hogares
            </h2>
            <p className="text-sm text-slate-600/70">
              Gestionar registros de ciudadanos con RSH.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
          <RSHGeneralInfo data={data} />
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
            <TableHeader>
              <p>Ciudadanos Registrados</p>
            </TableHeader>
            <Suspense fallback={<TablaCampañasSkeleton />}>
              <RSHTable query={query} currentPage={currentPage} />
            </Suspense>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
