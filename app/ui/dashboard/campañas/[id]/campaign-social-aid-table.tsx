import { SocialAid } from "@/app/lib/definitions";
import Pagination from "../../pagination";
import { formatDate, formatNumber } from "@/app/lib/utils/format";
import { fetchEntregasForCampaignDetail } from "@/app/lib/data/entregas";
import { getDV } from "@/app/lib/utils/get-values";
import CampaignSocialAidsTableSkeleton from "./table-skeleton";

export default async function CampaignSocialAidsTable({
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
          <thead className="border-y border-slate-200/70 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600/70">
            <tr className="grid grid-cols-26">
              <th className="col-span-5 py-4 pl-10 text-left font-normal">
                Folio
              </th>
              <th className="col-span-13 py-4 font-normal">Beneficiario</th>
              {/* <th className="py-4 col-span-5 pl-10 pr-6 font-normal"></th> */}
              <th className="col-span-4 py-4 text-right font-normal">RUT</th>
              <th className="col-span-4 py-4 pr-10 text-right font-normal">
                Entrega
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30">
            {data?.map((item: SocialAid, index: number) => (
              <TableRow key={index} item={item} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pages={pages} />
    </div>
  );
}

function TableRow({ item }: { item: SocialAid }) {
  const { folio, nombres_rsh, apellidos_rsh, rut, fecha_entrega } = item;
  const fecha = formatDate(fecha_entrega);
  const formatted_rut = formatNumber(Number(rut)) + (rut && "-" + getDV(rut));

  return (
    <tr className="grid grid-cols-26 text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="col-span-5 py-4 pl-10 text-slate-700">{folio}</td>
      <td className="col-span-13 py-4 text-slate-600">
        {nombres_rsh} {apellidos_rsh}
      </td>
      <td className="col-span-4 py-4 text-right text-slate-600">
        {formatted_rut}
      </td>
      <td className="col-span-4 py-4 pr-10 text-right text-slate-600">
        {fecha}
      </td>
    </tr>
  );
}
