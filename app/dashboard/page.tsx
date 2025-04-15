import GeneralInfoCards from "@/app/ui/dashboard/inicio/general-info-cards";
import Buscar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import PageHeader from "../ui/dashboard/page-header";
import { ActiveCampaignsSkeleton } from "../ui/dashboard/campañas/active-campaigns";
import { capitalize } from "../lib/utils/format";
import { getSession } from "../lib/session";
import { getUserData } from "../lib/data/usuario";
import { AuditLogsTable } from "../ui/dashboard/inicio/audit-table-logs";
import AuditTableSkeleton from "../ui/dashboard/inicio/audit-table-skeleton";
import HeatMap from "../ui/dashboard/inicio/heatmap";

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
          <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Tus Actividades
            </h2>
            <Buscar placeholder="Buscar..." />
          </div>
          <Suspense fallback={<AuditTableSkeleton />}>
            <AuditLogsTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
