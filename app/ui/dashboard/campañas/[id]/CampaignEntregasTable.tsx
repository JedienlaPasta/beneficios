import { EntregasCampañaDetail } from "@/app/lib/definitions";
import Pagination from "../../Pagination";
import { fetchEntregasForCampaignDetail } from "@/app/lib/data/entregas";
import TableRow from "./CampaignEntregasTableRow";

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
        <table className="w-full min-w-[44rem] border-collapse">
          <thead className="border-y border-slate-200/80 bg-slate-50 text-xs uppercase tracking-wider text-slate-600/70">
            <tr className="grid min-w-[1000px] grid-cols-26 items-center gap-4 px-5 text-left md:px-6">
              <th className="col-span-5 py-4 text-left font-normal">Folio</th>
              <th className="col-span-13 py-4 font-normal">Beneficiario</th>
              <th className="col-span-4 py-4 text-right font-normal">RUT</th>
              <th className="col-span-4 py-4 text-right font-normal">
                Entregado
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
