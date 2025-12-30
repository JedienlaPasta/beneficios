import { Suspense } from "react";
import SearchBar from "@/app/ui/dashboard/Searchbar";
import { AuditLogsTable } from "@/app/ui/dashboard/auditoria/AuditTableLogs";
import AuditTableSkeleton from "@/app/ui/dashboard/auditoria/AuditTableSkeleton";
import { Coffee } from "lucide-react";

type PageProps = {
  searchParams?: Promise<{ query?: string; page?: string; modal?: string }>;
};

export default async function Auditoria(props: PageProps) {
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams?.page) || 1;
  const query = searchParams?.query || "";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between 3xl:w-[96rem] 3xl:justify-self-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Registros de Auditoría
          </h2>
          <p className="text-sm text-slate-600/70">
            Aquí puedes comprobar todas las acciones realizadas por los usuarios
            de la plataforma.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 shadow-md shadow-slate-300/70">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 md:px-6 3xl:w-[96rem] 3xl:self-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-sm ring-1 ring-inset ring-blue-700/10">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-800">
                Actividades
              </h2>
              <p className="-mt-0.5 text-xs font-medium text-slate-500">
                Historial completo de actividades
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
  );
}
