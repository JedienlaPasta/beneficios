import { MdAutorenew } from "react-icons/md";
import { MdOutlineDeleteForever } from "react-icons/md";
import { BiFolderPlus } from "react-icons/bi";
import { formatDate } from "@/app/lib/utils/format";
import Pagination from "../pagination";
import { Activity } from "@/app/lib/definitions";
import { fetchUserActivity } from "@/app/lib/data/auditoria";

const ACTIVITY = [
  {
    type: "Editar",
    color: "bg-blue-100 text-blue-400",
    icon: <MdAutorenew />,
  },
  {
    type: "Crear",
    color: "bg-green-100 text-green-400",
    icon: <BiFolderPlus />,
  },
  {
    type: "Eliminar",
    color: "bg-red-100 text-red-400",
    icon: <MdOutlineDeleteForever />,
  },
];

type ActivityTableProps = {
  query: string;
  currentPage: number;
};
export default async function ActivityTable({
  query,
  currentPage,
}: ActivityTableProps) {
  const { data, pages } = (await fetchUserActivity(query, currentPage)) as {
    data: Activity[];
    pages: number;
  };

  const filas = data?.map((item: Activity, index: number) => (
    <TableRow key={index} item={item} />
  ));

  return (
    <div className="overflow-hidden rounded-b-xl bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem]">
          <thead className="border-y border-slate-200/70 bg-slate-50 text-xs font-medium tracking-wider text-slate-600/70">
            <tr>
              <th className="py-4 pl-10 pr-6 text-left font-normal">
                ACTIVIDAD
              </th>
              <th className="py-4 pr-14 text-right font-normal">FECHA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/30">{filas}</tbody>
        </table>
      </div>
      <Pagination pages={pages} />
    </div>
  );
}

function TableRow({ item }: { item: Activity }) {
  const { nombre, accion, dato, fecha, id_mod } = item;
  const fechaActividad = formatDate(fecha);

  const activityValues = ACTIVITY.find((activity) => activity.type === accion);

  return (
    <tr className="cursor-pointer text-nowrap text-sm tabular-nums transition-colors hover:bg-slate-200/50">
      <td className="flex items-center gap-3 py-4 pl-10 pr-6">
        <span className={`rounded-xl p-1 text-lg ${activityValues?.color}`}>
          {activityValues?.icon}{" "}
        </span>
        <div>
          <span className="font-medium text-slate-700">{nombre} </span>
          <span className="text-slate-500">{dato} </span>
          <span className="text-blue-400">{id_mod}</span>
        </div>
      </td>
      <td className="py-4 pr-14 text-right text-slate-600">{fechaActividad}</td>
    </tr>
  );
}
