import { Suspense } from "react";
import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/CampaignsTableSkeleton";
import RSHGeneralInfo from "@/app/ui/dashboard/rsh/general-info";
import RSHTable from "@/app/ui/dashboard/rsh/rsh-table";
import SearchBar from "@/app/ui/dashboard/searchbar";
import { Modal } from "@/app/ui/dashboard/modal";
import ModalCitizenDetailContext from "@/app/ui/dashboard/rsh/citizen-context-modal";
import RSHModals from "@/app/ui/dashboard/rsh/rsh-modals";
import { Users } from "lucide-react";

type RSHProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    citizen?: string;
    newcitizen?: string;
    importxlsx?: string;
  }>;
};

export default async function RSH(props: RSHProps) {
  const searchParams = await props.searchParams;
  const citizen = searchParams?.citizen || "";
  const newcitizen = searchParams?.newcitizen || "";
  const importxlsx = searchParams?.importxlsx || "";
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <div>
      <RSHModals newcitizen={newcitizen} importxlsx={importxlsx} />

      {citizen && citizen !== "" && (
        <Modal name="citizen">
          <ModalCitizenDetailContext name="citizen" rut={citizen} />
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
        <RSHGeneralInfo />
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 md:px-6 3xl:w-[96rem] 3xl:self-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-700/10">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Ciudadanos Registrados
                </h2>
                <p className="-mt-0.5 text-xs font-medium text-slate-500">
                  Base de datos del Registro Social
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchBar placeholder="Buscar..." />
            </div>
          </div>
          <Suspense fallback={<TablaCampañasSkeleton />}>
            <RSHTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
