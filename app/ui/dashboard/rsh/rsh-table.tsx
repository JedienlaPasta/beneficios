import { RSHTableData } from "@/app/lib/definitions";
import Pagination from "@/app/ui/dashboard/pagination";
import TableRow from "./table-row";
import { fetchRSH } from "@/app/lib/data/rsh";

type RSHTableProps = {
  query: string;
  currentPage: number;
};
export default async function RSHTable({ query, currentPage }: RSHTableProps) {
  const itemsPerPage = 10;
  const { data, pages } = await fetchRSH(query, currentPage, itemsPerPage);

  return (
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem]">
          <thead className="border-y border-slate-200/70 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-600/70">
            <tr>
              <th className="py-4 pl-10 pr-14 text-left font-normal">RUT</th>
              <th className="py-4 pl-10 pr-6 text-left font-normal">Nombre</th>
              <th className="py-4 pr-14 text-left font-normal">Dirección</th>
              <th className="px-6 py-4 text-left font-normal">Tramo</th>
              <th className="py-4 pr-10 text-right font-normal">
                Última Entrega
              </th>
              {/* <th className="py-4 pr-10 text-right font-normal">Detalle</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30">
            {data?.map((item: RSHTableData, index: number) => (
              <TableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pages={pages} />
    </div>
  );
}
