import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/CampaignsTableSkeleton";
import { Suspense } from "react";
import CitizenDetail, {
  CitizenDetailSkeleton,
} from "@/app/ui/dashboard/entregas/CitizenDetail";
import NewButton from "@/app/ui/dashboard/NewButton";
import SearchBar from "@/app/ui/dashboard/Searchbar";
import EntregasTable from "@/app/ui/dashboard/entregas/[id]/EntregasTable";
import ModalSkeleton from "@/app/ui/modal-skeleton";
import { Package2 } from "lucide-react";
import { Modal } from "@/app/ui/dashboard/Modal";
import ModalEntregasDetailContext from "@/app/ui/dashboard/entregas/[id]/detail-modal/ModalContext";
// import { Spinner } from "@/app/ui/dashboard/loaders";

type CitizenRecordProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    newsocialaid?: string;
    detailsModal?: string;
    editCitizenModal?: string;
    editBirthdateModal?: string;
    changeNameModal?: string;
    changeTramoModal?: string;
    justification?: string;
  }>;
  params: Promise<{ id: string }>;
};

export default async function CitizenRecord(props: CitizenRecordProps) {
  // Search params (query, page, modal)
  const searchParams = await props.searchParams;
  const newSocialAid = searchParams?.newsocialaid || "";
  const detailsModal = searchParams?.detailsModal || "";
  const changeNameModal = searchParams?.changeNameModal || "";
  const editCitizenModal = searchParams?.editCitizenModal || "";
  const editBirthdateModal = searchParams?.editBirthdateModal || "";
  const changeTramoModal = searchParams?.changeTramoModal || "";
  const justificationModal = searchParams?.justification || "";
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  // Params (id)
  const params = await props.params;
  const rut = params.id;

  return (
    <div>
      {detailsModal && (
        <Modal name="detailsModal">
          <Suspense fallback={<ModalSkeleton name="detailsModal" />}>
            <ModalEntregasDetailContext
              folio={detailsModal}
              rut={rut}
              isOnEditForJustification={justificationModal === "true"}
            />
          </Suspense>
        </Modal>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Detalle Ciudadano
          </h2>
          <p className="text-sm text-slate-600/70">
            Evalua y asigna la entrega de beneficios.
          </p>
        </div>
        <NewButton name="newsocialaid">Dar Beneficio</NewButton>
      </div>

      <div className="flex flex-col gap-4 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <Suspense fallback={<CitizenDetailSkeleton />}>
          <CitizenDetail
            rut={rut}
            isNameModalOpen={Boolean(changeNameModal)}
            isTramoModalOpen={Boolean(changeTramoModal)}
            isEditModalOpen={Boolean(editCitizenModal)}
            isBirthdateModalOpen={Boolean(editBirthdateModal)}
          />
        </Suspense>
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 md:px-6 3xl:w-[96rem] 3xl:self-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-inset ring-blue-700/10">
                <Package2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Beneficios Recibidos
                </h2>
                <p className="-mt-0.5 text-xs font-medium text-slate-500">
                  Historial completo de beneficios
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchBar placeholder="Buscar..." />
            </div>
          </div>
          <Suspense fallback={<TablaCampañasSkeleton />}>
            <EntregasTable
              rut={rut}
              query={query}
              currentPage={currentPage}
              isModalOpen={newSocialAid === "open"}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
