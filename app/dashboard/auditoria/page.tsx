import { Suspense } from "react";
import Pagination from "@/app/ui/dashboard/pagination";
import AuditTable from "@/app/ui/dashboard/auditoria/audit-table";
import SearchBar from "@/app/ui/dashboard/searchbar";
import { fetchActivity } from "@/app/lib/data/auditoria";

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
          <AuditLogsTable currentPage={currentPage} query={query} />
        </Suspense>
      </div>
    </div>
  );
}

async function AuditLogsTable({
  currentPage,
  query,
}: {
  currentPage: number;
  query: string;
}) {
  const { data, total } = await fetchActivity(query, currentPage, 10);

  return (
    <>
      <AuditTable logs={data} />
      <Pagination pages={total} />
    </>
  );
}

function AuditTableSkeleton() {
  return (
    <div className="p-4">
      <div className="mb-4 h-8 w-full animate-pulse rounded-md bg-slate-200"></div>
      <div className="space-y-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-16 w-full animate-pulse rounded-md bg-slate-100"
          ></div>
        ))}
      </div>
    </div>
  );
}
