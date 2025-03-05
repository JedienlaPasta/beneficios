import { MdAutorenew } from "react-icons/md";
import { MdOutlineDeleteForever } from "react-icons/md";
import { BiFolderPlus } from "react-icons/bi";

import { fetchActividadesUsuario } from "@/app/lib/data";
import { formatearFecha } from "@/app/lib/utils";
import Pagination from "../pagination";
import { Actividad } from "@/app/lib/definitions";

const ACTIVIDAD = [
  {
    tipo: "Editar",
    color: "bg-blue-100 text-blue-400",
    icono: <MdAutorenew />,
  },
  {
    tipo: "Crear",
    color: "bg-green-100 text-green-400",
    icono: <BiFolderPlus />,
  },
  {
    tipo: "Eliminar",
    color: "bg-red-100 text-red-400",
    icono: <MdOutlineDeleteForever />,
  },
];

type TablaActividadesProps = {
  busqueda: string;
  paginaActual: number;
};
export default async function TablaActividades({
  busqueda,
  paginaActual,
}: TablaActividadesProps) {
  const id = "51174ce0-a4ee-4e1c-8d44-dc35a3dff40f";
  const { data, paginas } = (await fetchActividadesUsuario(
    id,
    busqueda,
    paginaActual,
  )) as { data: Actividad[]; paginas: number };

  const filas = data?.map((item: Actividad, index: number) => (
    <TableRow key={index} item={item} />
  ));

  return (
    <div className="overflow-x-auto rounded-b-xl bg-white">
      <table className="w-full min-w-[44rem]">
        <thead className="border-y border-slate-200/70 bg-slate-50 text-xs font-medium tracking-wider text-slate-600/70">
          <tr>
            <th className="py-4 pl-10 pr-6 text-left font-normal">ACTIVIDAD</th>
            <th className="py-4 pr-14 text-right font-normal">FECHA</th>
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
    id_usuario: string;
    accion: string;
    dato: string;
    fecha: Date;
    nombre: string;
    id_campaña?: string;
    id_entrega?: string;
    id_rsh?: string;
  };
}) {
  const { nombre, accion, dato, fecha, id_campaña, id_entrega, id_rsh } = item;

  const fechaActividad = formatearFecha(fecha);

  const actividad = ACTIVIDAD.find((actividad) => actividad.tipo === accion);

  return (
    <tr className="cursor-pointer text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="flex items-center gap-3 py-4 pl-10 pr-6">
        <span className={`rounded-xl p-1 text-lg ${actividad?.color}`}>
          {actividad?.icono}{" "}
        </span>
        <div>
          <span className="font-medium text-slate-700">{nombre} </span>
          <span className="text-slate-500">{dato} </span>
          <span className="text-blue-400">
            {id_campaña || id_entrega || id_rsh}
          </span>
        </div>
      </td>
      <td className="py-4 pr-14 text-right text-slate-600">{fechaActividad}</td>
    </tr>
  );
}
