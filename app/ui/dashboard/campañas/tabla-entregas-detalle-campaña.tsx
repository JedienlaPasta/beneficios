import { fetchEntregasCampaña } from "@/app/lib/data";
import { EntregaDetalleCampaña } from "@/app/lib/definitions";
import Pagination from "../pagination";
import { formatearFecha } from "@/app/lib/utils";
import { FiBox } from "react-icons/fi";
import Link from "next/link";
import { CiViewList } from "react-icons/ci";

export default async function TablaEntregasDetalleCampaña({
  id,
}: {
  id: string;
}) {
  const { data, paginas } = await fetchEntregasCampaña(id);
  console.log(data);

  const filas = data?.map((item: EntregaDetalleCampaña, index: number) => (
    <TableRow key={index} item={item} />
  ));

  return (
    <div className="overflow-x-auto rounded-b-xl bg-white shadow-md shadow-slate-300">
      <table className="w-full min-w-[44rem]">
        <thead className="border-y border-slate-200/70 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-600/70">
          <tr>
            <th className="py-4 pl-10 pr-6 text-left font-normal">Campaña</th>
            <th className="py-4 pr-14 text-right font-normal">Inicio</th>
            <th className="py-4 pr-14 text-right font-normal">Término</th>
            <th className="px-6 py-4 text-left font-normal">Estado</th>
            <th className="py-4 pl-6 pr-10 text-right font-normal">Entregas</th>
            <th className="py-4 pr-10 text-right font-normal">Detalle</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/30">{filas}</tbody>
      </table>
      <Pagination paginas={paginas} />
    </div>
  );
}

function TableRow({
  item,
}: {
  item: {
    folio: string;
    nombre: string;
    fecha: Date;
  };
}) {
  const { folio, nombre, fecha } = item;
  const fecha_inicio = new Date(fecha);
  const fecha_termino = new Date(fecha);
  const estado = "En curso";
  const entregas = "0";

  const inicio = formatearFecha(fecha_inicio);
  const termino = formatearFecha(fecha_termino);

  const colorEstado =
    estado === "En curso"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  const id = "51174ce0-a4ee-4e1c-8d44-dc35a3dff40f";

  return (
    <tr className="text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="w-[30%] py-3 pl-10 pr-6 font-medium text-slate-700">
        {nombre}
      </td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">{inicio}</td>
      <td className="w-[15%] py-3 pr-14 text-right text-slate-600">
        {termino}
      </td>
      <td className="w-[10%] px-6 py-3">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${colorEstado}`}
        >
          {estado}
        </span>
      </td>
      <td className="w-[10%] items-center py-3 pl-6 pr-10 text-right text-slate-700">
        <div className="grid grid-cols-6 items-center gap-2 font-medium text-slate-700/90">
          <div className="col-span-5 flex w-full justify-end">
            <FiBox className="" />
          </div>
          {entregas}
        </div>
      </td>
      <td className="w-[10%] pl-6 pr-10 text-right">
        <Link
          href={`/dashboard/campanas/${id}`}
          className="flex items-center justify-end font-medium text-slate-700/90"
        >
          <CiViewList className="h-6 w-6 cursor-pointer" />
        </Link>
      </td>
    </tr>
  );
}
