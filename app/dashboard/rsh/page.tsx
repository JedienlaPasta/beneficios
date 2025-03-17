import { Suspense } from "react";
import Modal from "@/app/ui/dashboard/modal";
import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import RSHGeneralInfo from "@/app/ui/dashboard/rsh/general-info";
import RSHTable from "@/app/ui/dashboard/rsh/rsh-table";
import { fetchRSHInfo } from "@/app/lib/data/rsh";
import ImportXLSXModal from "@/app/ui/dashboard/rsh/import-xlsx-modal";
import SearchBar from "@/app/ui/dashboard/searchbar";
import NewCitizenModal from "@/app/ui/dashboard/rsh/new-citizen-modal";
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
      <div>
        {newcitizen === "open" && (
          <Modal>
            <NewCitizenModal />
          </Modal>
        )}
        {importxlsx === "open" && (
          <Modal>
            <ImportXLSXModal />
          </Modal>
        )}
        <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Registro Social de Hogares
            </h2>
            <p className="text-sm text-slate-600/70">
              Gestiona los registros de ciudadanos inscritos en el RSH.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
          <RSHGeneralInfo data={data} />
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
              <span className="flex flex-wrap items-center gap-2 text-nowrap text-lg font-semibold text-slate-800">
                <p>Ciudadanos Registrados</p>
              </span>
              <SearchBar placeholder="Buscar..." />
            </div>
            <Suspense fallback={<TablaCampañasSkeleton />}>
              <RSHTable query={query} currentPage={currentPage} />
            </Suspense>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
