import Pagination from "@/app/ui/dashboard/pagination";
import EntregasTableRow from "./entregas-table-row";
import { fetchEntregas } from "@/app/lib/data/entregas";

type EntregasProps = {
  query: string;
  currentPage: number;
};

export default async function EntregasTable({
  query,
  currentPage,
}: EntregasProps) {
  const { data, pages } = await fetchEntregas(query, currentPage, 4);

  return (
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse">
          <thead className="border-y border-slate-200/80 bg-slate-50 text-xs uppercase tracking-wider text-slate-600/70">
            <tr className="grid grid-cols-26 items-center gap-8 px-6 text-left">
              <th className="col-span-5 py-4 font-normal">Folio</th>
              <th className="col-span-4 py-4 font-normal">RUT</th>
              <th className="col-span-9 py-4 font-normal">Nombre</th>
              <th className="col-span-4 py-4 font-normal">Documentos</th>
              <th className="col-span-4 py-4 text-right font-normal">
                Entrega
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
