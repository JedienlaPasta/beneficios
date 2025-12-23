import Pagination from "@/app/ui/dashboard/pagination";
import EntregasTableRow from "./entregas-table-row";
import { fetchEntregas } from "@/app/lib/data/entregas";

type EntregasProps = {
  query: string;
  currentPage: number;
  status?: string;
  userFilter?: string;
  currentUserId?: string;
};

export default async function EntregasTable({
  query,
  currentPage,
  status,
  userFilter,
  currentUserId,
}: EntregasProps) {
  const filters = {
    status: status ? status.split(",") : undefined,
    userId: userFilter === "me" ? currentUserId : undefined,
  };

  const { data, pages } = await fetchEntregas(query, currentPage, 9, filters);

  return (
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse">
          <thead className="border-y border-slate-200/80 bg-slate-50 text-xs uppercase tracking-wider text-slate-600/70">
            <tr className="grid min-w-[1000px] grid-cols-26 items-center gap-4 px-5 text-left md:px-6">
              <th className="col-span-4 py-4 font-normal">RUT</th>
              <th className="col-span-7 py-4 font-normal">Nombre</th>
              <th className="col-span-4 py-4 text-right font-normal">Folio</th>
              <th className="col-span-4 py-4 text-right font-normal">
                Documentos
              </th>
              <th className="col-span-3 py-4 font-normal">Estado</th>
              <th className="col-span-4 py-4 text-right font-normal">
                Entregado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {data?.map((item, index) => (
              <EntregasTableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pages={pages} />
    </div>
  );
}
