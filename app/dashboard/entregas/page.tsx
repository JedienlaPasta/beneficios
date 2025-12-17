import SearchBar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import RSHTable from "@/app/ui/dashboard/entregas/rsh-table";
import SelectSearch from "@/app/ui/dashboard/entregas/select-search";
import EntregasTable from "@/app/ui/dashboard/entregas/entregas-table";
import ModalSkeleton from "@/app/ui/modal-skeleton";
import ModalEntregasDetailContext from "@/app/ui/dashboard/entregas/[id]/detail-modal/modal-context";
import EntregasFilter from "@/app/ui/dashboard/entregas/EntregasFilter";

import { getSession } from "@/app/lib/session";
import EntregasTableSkeleton from "@/app/ui/dashboard/entregas/EntregasTableSkeleton";

type SocialAidProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    table?: string;
    detailsModal?: string;
    justification?: string;
    supervisor?: string;
    rut?: string;
    status?: string;
    user?: string;
  }>;
};

export default async function Entregas(props: SocialAidProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const table = searchParams?.table || "ciudadanos";
  const detailsModal = searchParams?.detailsModal || "";
  const justificationModal = searchParams?.justification || "";
  const supervisorModal = searchParams?.supervisor || "";
  const rut = searchParams?.rut || "";
  const status = searchParams?.status || "";
  const userFilter = searchParams?.user || "me";

  const session = await getSession();
  const currentUserId = session?.userId ? String(session.userId) : "";

  return (
    <div className="flex flex-col gap-6">
      {detailsModal && (
        <Suspense fallback={<ModalSkeleton name="detailsModal" />}>
          <ModalEntregasDetailContext
            folio={detailsModal}
            rut={rut}
            isOnEditForJustification={justificationModal === "true"}
            isOnEditForSupervisor={supervisorModal === "true"}
          />
        </Suspense>
      )}
      <div className="flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Entregas</h2>
          <p className="text-sm text-slate-600/70">
            Gestiona la entrega de ayudas sociales a los ciudadanos de la
            comuna.
          </p>
        </div>
      </div>

      <SelectSearch />

      {/* Citizens Table */}
      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-4 px-5 pt-4 md:px-8 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
              {table === "entregas"
                ? "Entregas Registradas"
                : "Ciudadanos Registrados"}
            </h2>
            <div className="flex items-center gap-2">
              {table === "entregas" && <EntregasFilter />}
              <SearchBar placeholder="Buscar..." />
            </div>
          </div>
          <Suspense
            key={table + status + userFilter + currentPage}
            fallback={<EntregasTableSkeleton />}
          >
            {table === "entregas" ? (
              <EntregasTable
                query={query}
                currentPage={currentPage}
                status={status}
                userFilter={userFilter}
                currentUserId={currentUserId}
              />
            ) : (
              <RSHTable query={query} currentPage={currentPage} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
