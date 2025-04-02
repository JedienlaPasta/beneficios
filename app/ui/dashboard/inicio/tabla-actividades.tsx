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
  const rowsPerPage = 6;

  try {
    const { data, pages } = (await fetchUserActivity(
      query,
      currentPage,
      rowsPerPage,
    )) as {
      data?: Activity[];
      pages: number;
    };

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
            <tbody className="divide-y divide-slate-200/30">
              {data?.map((item: Activity, index: number) => (
                <TableRow key={index} item={item} />
              ))}
            </tbody>
          </table>
        </div>
        <Pagination pages={pages} />
      </div>
    );
  } catch (error) {
    console.log(error);
    return (
      <div className="flex flex-col justify-center rounded-b-xl border-t border-gray-200/80 bg-white p-6 text-center">
        <div className="mx-auto mb-2 flex items-center justify-center gap-2 rounded-full bg-amber-100/80 p-2 text-lg text-amber-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-slate-700">
          Información no disponible
        </h3>
        <p className="text-sm text-slate-500">
          Por favor, inténtelo de nuevo más tarde.
        </p>
      </div>
    );
  }
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
