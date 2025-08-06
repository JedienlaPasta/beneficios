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
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300/70">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse">
          <thead className="border-y border-slate-200/80 bg-slate-50 text-xs uppercase tracking-wider text-slate-600/70">
            <tr className="grid grid-cols-26 items-center gap-9 px-5 text-left md:px-8">
              <th className="col-span-5 py-4 text-left font-normal">Id</th>
              <th className="col-span-7 py-4 text-left font-normal">Campaña</th>
              <th className="col-span-3 py-4 text-left font-normal">
                Entregas
              </th>
              <th className="col-span-3 py-4 text-center font-normal">
                Estado
              </th>
              <th className="col-span-4 py-4 text-right font-normal">Inicio</th>
              <th className="col-span-4 py-4 text-right font-normal">
                Término
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80">
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
