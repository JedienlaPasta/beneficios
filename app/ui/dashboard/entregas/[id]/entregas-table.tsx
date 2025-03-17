import { SocialAidTableRow } from "@/app/lib/definitions";
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
  const { data, pages } = (await fetchSocialAidsByRUT(
    rut,
    query,
    currentPage,
  )) as {
    data: SocialAidTableRow[];
    pages: number;
  };

  return (
    <div className="overflow-x-auto rounded-b-xl bg-white shadow-md shadow-slate-300">
      <table className="w-full min-w-[44rem]">
        <thead className="border-y border-slate-200/70 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600/70">
          <tr>
            <th className="py-4 pl-10 pr-6 text-left font-normal">Folio</th>
            {/* <th className="py-4 pl-10 pr-6 font-normal">Campaña</th> */}
            {/* <th className="py-4 pl-10 pr-6 font-normal">Detalle</th> */}
            <th className="py-4 pl-10 pr-6 font-normal">Observacion</th>
            <th className="py-4 pl-10 pr-6 text-left font-normal">Encargado</th>
            <th className="py-4 pr-10 text-right font-normal">Entrega</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/30">
          {data?.map((item: SocialAidTableRow, index: number) => (
            <TableRow key={index} item={item} />
          ))}
        </tbody>
      </table>
      <Pagination pages={pages} />
    </div>
  );
}
