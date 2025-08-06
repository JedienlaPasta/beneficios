import CampaignsTableSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import SearchBar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import RSHTable from "@/app/ui/dashboard/entregas/rsh-table";
import SelectSearch from "@/app/ui/dashboard/entregas/select-search";
import EntregasTable from "@/app/ui/dashboard/entregas/entregas-table";
// import { Modal } from "@/app/ui/dashboard/modal";
import ModalSkeleton from "@/app/ui/modal-skeleton";
import ModalEntregasDetailContext from "@/app/ui/dashboard/entregas/[id]/modal-context";

type SocialAidProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    table?: string;
    detailsModal?: string;
    rut?: string;
  }>;
};

export default async function Entregas(props: SocialAidProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const table = searchParams?.table || "ciudadanos";
  const detailsModal = searchParams?.detailsModal || "";
  const rut = searchParams?.rut || "";

  return (
    <div className="flex flex-col gap-6">
      {detailsModal && (
        // <Modal name="detailsModal" secondName="rut">
        <Suspense fallback={<ModalSkeleton name="detailsModal" />}>
          <ModalEntregasDetailContext folio={detailsModal} rut={rut} />
        </Suspense>
        // </Modal>
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
                ? "Lista de Entregas"
                : "Lista de Ciudadanos"}
            </h2>
            <SearchBar placeholder="Buscar..." />
          </div>
          <Suspense key={table} fallback={<CampaignsTableSkeleton />}>
            {table === "entregas" ? (
              <EntregasTable query={query} currentPage={currentPage} />
            ) : (
              <RSHTable query={query} currentPage={currentPage} />
            )}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
