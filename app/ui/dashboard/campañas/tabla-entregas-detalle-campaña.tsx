import { fetchEntregasCampaña } from "@/app/lib/data";
import { EntregaDetalleCampaña } from "@/app/lib/definitions";
import Pagination from "../pagination";
import { formatearFecha } from "@/app/lib/utils";

export default async function TablaEntregasDetalleCampaña({
  id,
  paginaActual,
}: {
  id: string;
  paginaActual: number;
}) {
  const { data, paginas } = (await fetchEntregasCampaña(id, paginaActual)) as {
    data: EntregaDetalleCampaña[];
    paginas: number;
  };

  const filas = data?.map((item: EntregaDetalleCampaña, index: number) => (
    <TableRow key={index} item={item} />
  ));

  return (
    <div className="overflow-x-auto rounded-b-xl bg-white shadow-md shadow-slate-300">
      <table className="w-full min-w-[44rem]">
        <thead className="border-y border-slate-200/70 bg-slate-50 text-left text-xs font-medium uppercase tracking-wider text-slate-600/70">
          <tr>
            <th className="py-4 pl-10 pr-6 text-left font-normal">Folio</th>
            <th className="py-4 pl-10 pr-6 font-normal">Beneficiario</th>
            <th className="py-4 pl-10 pr-6 font-normal"></th>
            <th className="py-4 pr-14 text-right font-normal">RUT</th>
            <th className="py-4 pr-14 text-right font-normal">Entrega</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/30">{filas}</tbody>
      </table>
      <Pagination paginas={paginas} />
    </div>
  );
}

function TableRow({ item }: { item: EntregaDetalleCampaña }) {
  const { folio, beneficio, nombre, apellidos, rut, fecha } = item;

  const fecha_entrega = formatearFecha(fecha);

  return (
    <tr className="text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="w-[10%] py-3 pl-10 pr-6 font-medium text-slate-700">
        {folio}
      </td>
      <td className="w-[30%] py-3 pl-10 pr-6 text-slate-600">
        {nombre} {apellidos}
      </td>
      <td className="w-[30%] py-3 pl-10 pr-6 text-slate-600">
        {/* white space */}
      </td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">{rut}</td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">
        {fecha_entrega}
      </td>
    </tr>
  );
}
