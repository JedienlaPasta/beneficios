import React from "react";
import { AuditLog } from "../AuditTable";
import { capitalize, formatDate } from "@/app/lib/utils/format";
import { motion } from "framer-motion";
import {
  FaUser,
  FaCalendarDays,
  FaBolt,
  FaHashtag,
  FaMessage,
  FaXmark,
} from "react-icons/fa6";

type ModalProps = {
  selectedLog: AuditLog;
  setSelectedLog: React.Dispatch<React.SetStateAction<AuditLog | null>>;
};

export default function AuditDetailsModal({
  selectedLog,
  setSelectedLog,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-slate-900/50 xs:items-center xs:p-4">
      <div
        onClick={() => setSelectedLog(null)}
        className="absolute inset-0 z-0"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="z-[100] flex w-full flex-col gap-6 overflow-hidden bg-white p-4 shadow-xl ring-1 ring-slate-200/70 transition-all duration-500 scrollbar-hide xs:w-full xs:rounded-3xl xs:p-8 sm:w-[32rem]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-lg font-semibold tracking-tight text-slate-700">
            Detalles de Auditoría
          </h2>
          <button
            onClick={() => setSelectedLog(null)}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
          >
            <FaXmark className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <DetailItem
              icon={FaUser}
              label="Usuario"
              value={selectedLog.nombre_usuario}
            />
            <DetailItem
              icon={FaBolt}
              label="Acción"
              value={capitalize(selectedLog.accion)}
              highlight
            />
            <DetailItem
              icon={FaCalendarDays}
              label="Fecha"
              value={formatDate(new Date(selectedLog.fecha))}
            />
            <DetailItem
              icon={FaHashtag}
              label="ID Registro"
              value={selectedLog.id_registro_mod || "No disponible"}
            />
          </div>

          {selectedLog.comentario_accion && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <FaMessage className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-500">
                    Detalle de la Acción
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {capitalize(selectedLog.comentario_accion)}
                    {selectedLog.comentario_nombre && (
                      <span className="ml-1 font-semibold text-blue-700">
                        {selectedLog.comentario_nombre}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          highlight
            ? "bg-amber-100 text-amber-600"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="text-sm font-normal text-slate-700">{value || "—"}</p>
      </div>
    </div>
  );
}
