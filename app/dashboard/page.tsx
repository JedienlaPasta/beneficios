import GeneralInfoCards from "@/app/ui/dashboard/inicio/general-info-cards";
import SearchBar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import PageHeader from "../ui/dashboard/page-header";
import { ActiveCampaignsSkeleton } from "../ui/dashboard/campañas/ActiveCampaigns";
import { capitalize } from "../lib/utils/format";
import { getSession } from "../lib/session";
import { getUserData } from "../lib/data/usuario";
import { AuditLogsTable } from "../ui/dashboard/inicio/audit-table-logs";
import AuditTableSkeleton from "../ui/dashboard/inicio/audit-table-skeleton";
import HeatMap from "../ui/dashboard/inicio/heatmap";
import { Coffee } from "lucide-react";

type HomeProps = {
  searchParams?: Promise<{
    query?: string;
    page?: string;
    modal?: string;
    year?: string;
  }>;
};

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const year = searchParams?.year || "2025";

  // Get userId from jwt
  const userSession = await getSession();
  if (!userSession?.userId) {
    return null;
  }
  // Get user data from userId
  const userData = await getUserData(String(userSession.userId));
  const userName = capitalize(
    userData ? userData.nombre_usuario?.split(" ")[0] : "",
  );

  return (
    <div>
      <Suspense fallback={<div>Cargando...</div>}>
        <PageHeader
          title={`Bienvenid@ ${userName}!`}
          description="Aquí podrás ver información general y sobre las actividades que has realizado."
        />
      </Suspense>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <Suspense fallback={<ActiveCampaignsSkeleton />}>
          <GeneralInfoCards />
        </Suspense>
        <Suspense fallback={<div>Cargando...</div>}>
          <HeatMap year={year} />
        </Suspense>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 shadow-md shadow-slate-300/70">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 md:px-6 3xl:w-[96rem] 3xl:self-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-inset ring-blue-700/10">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Mis Actividades
                </h2>
                <p className="-mt-0.5 text-xs font-medium text-slate-500">
                  Historial personal de actividades
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SearchBar placeholder="Buscar..." />
            </div>
          </div>
          <Suspense fallback={<AuditTableSkeleton />}>
            <AuditLogsTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
