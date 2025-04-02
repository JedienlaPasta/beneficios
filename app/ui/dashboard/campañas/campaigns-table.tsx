import { Campaign } from "@/app/lib/definitions";
import Pagination from "@/app/ui/dashboard/pagination";
import TableRow from "./table-row";
import { fetchCampaigns } from "@/app/lib/data/campañas";

type CampaignsTableProps = {
  query: string;
  currentPage: number;
};
export default async function CampaignsTable({
  query,
  currentPage,
}: CampaignsTableProps) {
  const resultsPerPage = 10;
  const { data, pages } = await fetchCampaigns(
    query,
    currentPage,
    resultsPerPage,
  );

  return (
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem]">
          <thead className="border-y border-slate-200/70 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-600/70">
            <tr>
              <th className="py-4 pl-10 text-left font-normal">Id</th>
              <th className="py-4 text-left font-normal">Campaña</th>
              <th className="py-4 text-left font-normal">Entregas</th>
              <th className="py-4 text-left font-normal">Estado</th>
              <th className="py-4 text-right font-normal">Inicio</th>
              <th className="py-4 pr-10 text-right font-normal">Término</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30">
            {data?.map((item: Campaign, index: number) => (
              <TableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pages={pages} />
    </div>
  );
}
