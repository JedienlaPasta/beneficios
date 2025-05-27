import React from "react";
import { AuditLog } from "../audit-table";
import { capitalize, formatDate } from "@/app/lib/utils/format";

type ModalProps = {
  selectedLog: AuditLog;
  setSelectedLog: React.Dispatch<React.SetStateAction<AuditLog | null>>;
};

export default function AuditDetailsModal({
  selectedLog,
  setSelectedLog,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4">
      <div
        onClick={() => setSelectedLog(null)}
        className="fixed inset-0 -z-10"
      />
      <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white p-8 shadow-xl transition-all">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-700">
              Detalles de la acción
            </h3>
            <button
              onClick={() => setSelectedLog(null)}
              className="rounded-full p-1 text-slate-400 transition-colors hover:text-slate-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="pt-1">
          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Usuario
              </p>
              <p className="font-mediums text-sm text-slate-700">
                {selectedLog.nombre_usuario || "No disponible"}
              </p>
            </div>
            <div className="p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Acción
              </p>
              <p className="font-mediums text-sm text-slate-700">
                {capitalize(selectedLog.accion)}
              </p>
            </div>
            <div className="p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Fecha
              </p>
              <p className="font-mediums text-sm text-slate-700">
                {formatDate(new Date(selectedLog.fecha))}
              </p>
            </div>
            <div className="p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Id Registro Modificado
              </p>
              <p className="font-mediums text-sm text-slate-700">
                {selectedLog.id_registro_mod || "No disponible"}
              </p>
            </div>
          </div>

          {selectedLog.comentario_accion && (
            <div className="rounded-lg border border-slate-200 bg-slate-100 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Dato
              </p>
              <span className="font-mediums flex gap-1 text-sm text-slate-700">
                <p>{capitalize(selectedLog.comentario_accion)}</p>
                <p className="text-blue-400">
                  {selectedLog.comentario_nombre || ""}
                </p>
              </span>
            </div>
          )}

          {/* <div className="flex justify-end">
            <button
              onClick={() => setSelectedLog(null)}
              className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-medium text-white outline-none transition-colors hover:bg-slate-700"
            >
              Cerrar
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}
