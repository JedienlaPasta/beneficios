import GeneralInfoCards from "@/app/ui/dashboard/inicio/general-info-cards";
import HeatMapTable from "@/app/ui/dashboard/inicio/heatmap-table";
import ActivityTable from "@/app/ui/dashboard/inicio/tabla-actividades";
import ActivityTableSkeleton from "@/app/ui/dashboard/inicio/activity-table-skeleton";
import Buscar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import PageHeader from "../ui/dashboard/page-header";
import { ActiveCampaignsSkeleton } from "../ui/dashboard/campañas/active-campaigns";
import { capitalize } from "../lib/utils/format";
import { getSession } from "../lib/session";
import { getUserData } from "../lib/data/usuario";

type HomeProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

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
        <div className="items-centers w-fits flex flex-col justify-center gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-white px-10 py-4 shadow-md shadow-slate-300/70">
          <div className="flex w-full items-center justify-between">
            <h2 className="my-2 text-lg font-semibold text-slate-800">
              Entregas Realizadas
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Año:</span>
              <select
                className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none"
                defaultValue={new Date().getFullYear()}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <HeatMapTable />
          <div className="flex w-fit flex-nowrap justify-end gap-1 self-start rounded-lg border border-slate-200 px-2 py-1">
            <p className="text-xs text-slate-400">Poco</p>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-slate-200 bg-slate-100"></div>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-300 bg-green-100"></div>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-400 bg-green-200"></div>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-500 bg-green-300"></div>
            <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-600 bg-green-400"></div>
            <p className="text-xs text-slate-400">Mucho</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 shadow-md shadow-slate-300/70">
          <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
            <h2 className="text-lg font-semibold text-slate-800">
              Tus Actividades
            </h2>
            <Buscar placeholder="Buscar..." />
          </div>
          <Suspense fallback={<ActivityTableSkeleton />}>
            <ActivityTable query={query} currentPage={currentPage} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
