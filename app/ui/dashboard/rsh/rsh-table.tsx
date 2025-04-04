// import { RSHTableData } from "@/app/lib/definitions";
import Pagination from "@/app/ui/dashboard/pagination";
import TableRow from "./table-row";
import { fetchRSH } from "@/app/lib/data/rsh";

type RSHTableProps = {
  query: string;
  currentPage: number;
};
export default async function RSHTable({ query, currentPage }: RSHTableProps) {
  const itemsPerPage = 8;
  const { data, pages } = await fetchRSH(query, currentPage, itemsPerPage);

  return (
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse">
          <thead className="border-y border-slate-200/80 bg-slate-50 text-xs uppercase tracking-wider text-slate-600/70">
            <tr className="grid grid-cols-26 items-center gap-9 px-6 text-left">
              <th className="col-span-4 py-4 font-normal">RUT</th>
              <th className="col-span-6 py-4 font-normal">Nombre</th>
              <th className="col-span-8 py-4 font-normal">Dirección</th>
              <th className="col-span-4 py-4 text-center font-normal">Tramo</th>
              <th className="col-span-4 py-4 text-right font-normal">
                Última Entrega
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {data?.map((item, index) => <TableRow key={index} item={item} />)}
          </tbody>
        </table>
      </div>
      <Pagination pages={pages} />
    </div>
  );
}
