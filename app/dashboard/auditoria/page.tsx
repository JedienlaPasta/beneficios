import { Suspense } from "react";
import SearchBar from "@/app/ui/dashboard/searchbar";
import { AuditLogsTable } from "@/app/ui/dashboard/auditoria/audit-table-logs";
import AuditTableSkeleton from "@/app/ui/dashboard/auditoria/audit-table-skeleton";

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
        <div className="flex flex-wrap items-center justify-between gap-4 px-10 pt-4 3xl:w-[96rem] 3xl:self-center">
          <h2 className="text-lg font-semibold text-slate-800">Actividades</h2>
          <SearchBar placeholder="Buscar..." />
        </div>
        <Suspense fallback={<AuditTableSkeleton />}>
          <AuditLogsTable query={query} currentPage={currentPage} />
        </Suspense>
      </div>
    </div>
  );
}
