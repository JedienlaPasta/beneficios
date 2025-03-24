import CampaignsTableSkeleton from "@/app/ui/dashboard/campañas/campaigns-table-skeleton";
import SearchBar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import SocialAidsTable from "@/app/ui/dashboard/entregas/social-aids-table";
import ProtectedRoute from "@/app/dashboard/ProtectedRoute";

type SocialAidProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
  }>;
};

export default async function SocialAid(props: SocialAidProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <ProtectedRoute isDashboardRoute={true}>
      <div>
        <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Entregas</h2>
            <p className="text-sm text-slate-600/70">
              Gestiona la entrega de ayudas sociales a los ciudadanos de la
              comuna.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
              <h2 className="text-lg font-semibold text-slate-800">
                Lista de Ciudadanos
              </h2>
              <SearchBar placeholder="Buscar..." />
            </div>
            <Suspense fallback={<CampaignsTableSkeleton />}>
              <SocialAidsTable query={query} currentPage={currentPage} />
            </Suspense>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
