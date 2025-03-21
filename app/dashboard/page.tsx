import GeneralInfoCards from "@/app/ui/dashboard/inicio/general-info-cards";
import SocialAidActivityBoard from "@/app/ui/dashboard/inicio/social-aid-activity-board";
import ActivityTable from "@/app/ui/dashboard/inicio/tabla-actividades";
import ActivityTableSkeleton from "@/app/ui/dashboard/inicio/activity-table-skeleton";
import Buscar from "@/app/ui/dashboard/searchbar";
import { Suspense } from "react";
import ProtectedRoute from "@/app/dashboard/ProtectedRoute";
import PageHeader from "../ui/dashboard/page-header";

type HomeProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function Home(props: HomeProps) {
  const searchParams = await props.searchParams;
  // const modal = searchParams?.modal || "";
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;

  return (
    <ProtectedRoute isDashboardRoute={true}>
      <div>
        {/* {abrirModal && <NuevaCampañaModal closeModal={toggleModal} />} */}
        <PageHeader />

        <div className="flex flex-col gap-6 overflow-hidden rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
          <GeneralInfoCards />
          <div className="items-centers w-fits flex flex-col justify-center gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-white px-10 py-4 shadow-md shadow-slate-300">
            <h2 className="my-2 text-lg font-semibold text-slate-800">
              Entregas Realizadas
            </h2>
            <SocialAidActivityBoard />
            <div className="flex w-fit flex-nowrap justify-end gap-1 self-start rounded-lg border border-slate-200 px-2 py-1">
              <p className="text-xs text-slate-400">Poco</p>
              <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-slate-200 bg-slate-100"></div>
              <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-300 bg-green-100"></div>
              <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-400 bg-green-200"></div>
              <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-500 bg-green-300"></div>
              <div className="group relative flex h-4 w-4 items-center justify-center rounded border border-green-600 bg-green-400"></div>
              <p className="text-xs text-slate-400">Mucho :)</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 shadow-md shadow-slate-300">
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
    </ProtectedRoute>
  );
}
