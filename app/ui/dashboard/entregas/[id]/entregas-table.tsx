import { SocialAidTableRow } from "@/app/lib/definitions";
import Pagination from "../../pagination";
import { formatDate } from "@/app/lib/utils";
import { fetchSocialAidsByRUT } from "@/app/lib/data/entregas";

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
            <th className="py-4 pl-10 pr-6 font-normal">Campaña</th>
            <th className="py-4 pl-10 pr-6 font-normal">Detalle</th>
            <th className="py-4 pl-10 pr-6 font-normal">Observacion</th>
            <th className="py-4 pl-10 pr-6 text-left font-normal">Encargado</th>
            <th className="py-4 pr-14 text-right font-normal">Entrega</th>
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

function TableRow({ item }: { item: SocialAidTableRow }) {
  const {
    folio,
    nombre_campaña,
    detalle,
    observacion,
    nombre_usuario,
    fecha_entrega,
  } = item;
  const fecha = formatDate(fecha_entrega);

  return (
    <tr className="text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="w-[10%] py-3 pl-10 pr-6 font-medium text-slate-700">
        {folio}
      </td>
      <td className="w-[20%] py-3 pl-10 pr-6 text-slate-600">
        {nombre_campaña}
      </td>
      <td className="w-[15%] py-3 pl-10 pr-6 text-slate-600">{detalle}</td>
      <td className="w-[25%] py-3 pl-10 pr-6 text-slate-600">{observacion}</td>
      <td className="w-[15%] py-3 pl-10 pr-6 text-slate-600">
        {nombre_usuario}
      </td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">{fecha}</td>
    </tr>
  );
}
