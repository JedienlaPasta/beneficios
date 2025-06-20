"use client";

import { useState } from "react";
import { formatDate, formatTime } from "@/app/lib/utils/format";
import { MdAutorenew } from "react-icons/md";
import { MdOutlineDeleteForever } from "react-icons/md";
import { BiFolderPlus } from "react-icons/bi";
import Pagination from "./pagination";
import AuditDetailsModal from "./auditoria/details-modal";

const ACTIVITY = [
  {
    type: "editar",
    color: "bg-blue-100 text-blue-400",
    icon: <MdAutorenew />,
  },
  {
    type: "crear",
    color: "bg-green-100 text-green-400",
    icon: <BiFolderPlus />,
  },
  {
    type: "eliminar",
    color: "bg-red-100 text-red-400",
    icon: <MdOutlineDeleteForever />,
  },
];

export type AuditLog = {
  // id?: string;
  accion: string;
  comentario_accion: string;
  comentario_nombre?: string;
  fecha: string;
  id_usuario: string;
  nombre_usuario: string;
  id_registro_mod?: string;
};

export default function AuditTable({
  logs,
  pages,
}: {
  logs: AuditLog[];
  pages: number;
}) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (!logs) {
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
          No hay registros de auditoría disponibles
        </h3>
        <p className="text-sm text-slate-500">
          Por favor, inténtelo de nuevo más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-b-xl bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse select-none">
          <thead className="border-y border-slate-200/70 bg-slate-50 text-xs font-medium tracking-wider text-slate-600/70">
            <tr className="grid grid-cols-26 items-center gap-8 px-6">
              <th className="col-span-8 py-4 text-left font-normal">
                ACTIVIDAD
              </th>
              <th className="col-span-12 py-4 text-right font-normal">
                ID REGISTRO MODIFICADO
              </th>
              <th className="col-span-6 py-4 text-right font-normal">FECHA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70">
            {logs.map((log, index) => (
              <tr
                key={String(log.id_registro_mod) + index}
                className="grid cursor-pointer grid-cols-26 items-center gap-8 text-nowrap px-6 text-sm tabular-nums transition-colors hover:bg-slate-200/50"
                onClick={() => setSelectedLog(log)}
              >
                <td className="col-span-12 flex items-center gap-3 py-5">
                  <span
                    className={`rounded-xl p-1 text-lg ${getActivityStyle(log.accion).color}`}
                  >
                    {getActivityStyle(log.accion).icon}
                  </span>
                  <div>
                    <span className="font-medium text-slate-700">
                      {log.nombre_usuario || "Usuario"}{" "}
                    </span>
                    <span className="text-slate-500">
                      {log.comentario_accion || log.accion}{" "}
                    </span>
                    <span className="text-blue-400">
                      {log.comentario_nombre}
                    </span>
                  </div>
                </td>
                <td className="col-span-8 overflow-hidden text-ellipsis py-4 text-right text-slate-500">
                  <span className="">
                    {log.id_registro_mod || "No disponible"}
                  </span>
                </td>
                <td className="col-span-6 text-right text-slate-600">
                  <div className="text-slate-600">
                    {formatDate(new Date(log.fecha))}
                  </div>
                  <div className="text-xs text-slate-500/80">
                    {formatTime(new Date(log.fecha))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination pages={pages} />

      {/* Details Modal */}
      {selectedLog && (
        <AuditDetailsModal
          selectedLog={selectedLog}
          setSelectedLog={setSelectedLog}
        />
      )}
    </div>
  );
}

function getActivityStyle(action: string) {
  const actionLower = action.toLowerCase();

  if (actionLower.includes("crear"))
    return ACTIVITY.find((a) => a.type === "crear") || ACTIVITY[1];

  if (actionLower.includes("eliminar"))
    return ACTIVITY.find((a) => a.type === "eliminar") || ACTIVITY[2];

  // Default to edit for any other action
  return ACTIVITY.find((a) => a.type === "editar") || ACTIVITY[0];
}
