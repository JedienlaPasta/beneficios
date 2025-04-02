// import { SocialAidTableRow } from "@/app/lib/definitions";
import Pagination from "../../pagination";
import { fetchSocialAidsByRUT } from "@/app/lib/data/entregas";
import TableRow from "./table-row";

type SocialAidsDetailTableProps = {
  rut: string;
  query: string;
  currentPage: number;
};

export default async function SocialAidsDetailTable({
  rut,
  query,
  currentPage,
}: SocialAidsDetailTableProps) {
  const itemsPerPage = 10;
  const { data, pages } = await fetchSocialAidsByRUT(
    rut,
    query,
    currentPage,
    itemsPerPage,
  );

  return (
    <div className="overflow-hidden rounded-b-xl bg-white shadow-md shadow-slate-300">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem]">
          <thead className="border-y border-slate-200/70 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600/70">
            <tr>
              <th className="py-4 pl-10 text-left font-normal">Folio</th>
              <th className="py-4 text-left font-normal">Encargado</th>
              <th className="py-4 font-normal">Documentos</th>
              <th className="py-4 pr-10 text-right font-normal">Entrega</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30">
            {data?.map((item, index: number) => (
              <TableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pages={pages} />
    </div>
  );
}
