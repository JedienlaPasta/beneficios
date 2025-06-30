import { EntregasCampañaDetail } from "@/app/lib/definitions";
import Pagination from "../../pagination";
import { fetchEntregasForCampaignDetail } from "@/app/lib/data/entregas";
import TableRow from "./campaign-entregas-table-row";

export default async function CampaignEntregasTable({
  id,
  query,
  paginaActual,
}: {
  id: string;
  query: string;
  paginaActual: number;
}) {
  const itemsPerPage = 10;
  const { data, pages } = await fetchEntregasForCampaignDetail(
    id,
    query,
    paginaActual,
    itemsPerPage,
  );

  return (
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem]">
          <thead className="border-y border-gray-200/80 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600/70">
            <tr className="grid grid-cols-26 gap-8 px-8">
              <th className="col-span-5 py-4 text-left font-normal">Folio</th>
              <th className="col-span-13 py-4 font-normal">Beneficiario</th>
              <th className="col-span-4 py-4 text-right font-normal">RUT</th>
              <th className="col-span-4 py-4 text-right font-normal">
                Entrega
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
            {data?.map((item: EntregasCampañaDetail, index: number) => (
              <TableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pages={pages} />
    </div>
  );
}
