import SearchBar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import RSHTable from "@/app/ui/dashboard/entregas/rsh-table";
import SelectSearch from "@/app/ui/dashboard/entregas/select-search";
import EntregasTable from "@/app/ui/dashboard/entregas/entregas-table";
import ModalSkeleton from "@/app/ui/modal-skeleton";
import ModalEntregasDetailContext from "@/app/ui/dashboard/entregas/[id]/detail-modal/modal-context";
import EntregasFilter from "@/app/ui/dashboard/entregas/EntregasFilter";
import { Modal } from "@/app/ui/dashboard/modal";
import { getSession } from "@/app/lib/session";
import EntregasTableSkeleton from "@/app/ui/dashboard/entregas/EntregasTableSkeleton";
import { Package2, Users } from "lucide-react";

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
        <Modal name="detailsModal">
          <Suspense fallback={<ModalSkeleton name="detailsModal" />}>
            <ModalEntregasDetailContext
              folio={detailsModal}
              rut={rut}
              isOnEditForJustification={justificationModal === "true"}
              isOnEditForSupervisor={supervisorModal === "true"}
            />
          </Suspense>
        </Modal>
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
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 md:px-6 3xl:w-[96rem] 3xl:self-center">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-sm ring-1 ring-inset ${
                  table === "entregas"
                    ? "bg-blue-50 text-blue-600 ring-blue-700/10"
                    : "bg-indigo-50 text-indigo-600 ring-indigo-700/10"
                }`}
              >
                {table === "entregas" ? (
                  <Package2 className="h-5 w-5" />
                ) : (
                  <Users className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  {table === "entregas"
                    ? "Entregas Registradas"
                    : "Ciudadanos Registrados"}
                </h2>
                <p className="-mt-0.5 text-xs font-medium text-slate-500">
                  {table === "entregas"
                    ? "Historial completo de beneficios"
                    : "Base de datos del Registro Social"}
                </p>
              </div>
            </div>
            {/* <div className="flex flex-col gap-2 sm:flex-row sm:items-center"> */}
            <div className="flex flex-wrap items-center gap-2">
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
