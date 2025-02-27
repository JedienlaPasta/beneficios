import { FiBox } from "react-icons/fi";
import { fetchCampañasFiltradas } from "@/app/lib/data";
import { formatearFecha } from "@/app/lib/utils";
import Pagination from "./pagination";
import { Campaña } from "@/app/lib/definitios";

type TablaDatosDashboardProps = {
  busqueda: string;
  paginaActual: number;
};
export default async function TablaDatosDashboard({
  busqueda,
  paginaActual,
}: TablaDatosDashboardProps) {
  const { data, totalPaginas } = await fetchCampañasFiltradas(
    busqueda,
    paginaActual,
  );

  const filas = data?.map((item: Campaña, index: number) => (
    <TableRow key={index} item={item} />
  ));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[44rem]">
        <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-600/70">
          <tr>
            <th className="py-4 pl-10 pr-6 text-left font-normal">Campaña</th>
            <th className="py-4 pr-14 text-right font-normal">Inicio</th>
            <th className="py-4 pr-14 text-right font-normal">Término</th>
            <th className="px-6 py-4 text-left font-normal">Estado</th>
            <th className="py-4 pl-6 pr-10 text-right font-normal">Entregas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">{filas}</tbody>
      </table>
      <Pagination totalPaginas={totalPaginas} />
    </div>
  );
}

function TableRow({
  item,
}: {
  item: {
    nombre: string;
    entregas: number;
    estado: "En curso" | "Finalizado";
    fecha_inicio: Date;
    fecha_termino: Date;
  };
}) {
  const { nombre, entregas, estado, fecha_inicio, fecha_termino } = item;

  const inicio = formatearFecha(fecha_inicio);
  const termino = formatearFecha(fecha_termino);

  const colorEstado =
    estado === "En curso"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <tr className="cursor-pointer text-nowrap text-sm tabular-nums transition-colors hover:bg-gray-200/90">
      <td className="w-[30%] py-4 pl-10 pr-6 font-medium text-slate-700">
        {nombre}
      </td>
      <td className="w-[20%] py-4 pr-14 text-right text-slate-600">{inicio}</td>
      <td className="w-[20%] py-4 pr-14 text-right text-slate-600">
        {termino}
      </td>
      <td className="w-[10%] px-6 py-4">
        <span
          className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${colorEstado}`}
        >
          {estado}
        </span>
      </td>
      <td className="w-[20%] items-center py-4 pl-6 pr-10 text-right text-slate-700">
        <div className="grid grid-cols-6 items-center gap-2 font-medium text-slate-700/90">
          <div className="col-span-5 flex w-full justify-end">
            <FiBox className="" />
          </div>
          {entregas}
        </div>
      </td>
    </tr>
  );
}
