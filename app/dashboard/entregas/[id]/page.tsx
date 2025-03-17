import TablaCampañasSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import { Suspense } from "react";
import CitizenDetail from "@/app/ui/dashboard/entregas/citizen-detail";
import Modal from "@/app/ui/dashboard/modal";
import NewSocialAidModal from "@/app/ui/dashboard/entregas/new-social-aid-modal";
import { fetchRSHById } from "@/app/lib/data/rsh";
import NewButton from "@/app/ui/dashboard/new-button";
import SearchBar from "@/app/ui/dashboard/searchbar";
import SocialAidsDetailTable from "@/app/ui/dashboard/entregas/[id]/entregas-table";

type CitizenRecordProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    newsocialaid?: string;
  }>;
  params: Promise<{ id: string }>;
};

export default async function CitizenRecord(props: CitizenRecordProps) {
  // Search params (query, page, modal)
  const searchParams = await props.searchParams;
  const newSocialAid = searchParams?.newsocialaid || "";
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  // Params (id)
  const params = await props.params;
  const id = params.id;

  const { data } = await fetchRSHById(id);
  if (data.length === 0) {
    return null;
  }

  return (
    <div>
      {newSocialAid === "open" && (
        <Modal>
          <NewSocialAidModal data={data} />
        </Modal>
      )}
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
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

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <CitizenDetail data={data} />
        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <span className="flex flex-wrap items-center gap-2 text-nowrap text-lg font-semibold text-slate-800">
              <p>Beneficios Recibidos</p>
              <p className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-500">
                #{id}
              </p>
            </span>
            <SearchBar placeholder="Buscar..." />
          </div>
          <Suspense fallback={<TablaCampañasSkeleton />}>
            {/* POR HACER, TABLA ENTREGAS */}
            <SocialAidsDetailTable
              rut={id}
              query={query}
              currentPage={currentPage}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
