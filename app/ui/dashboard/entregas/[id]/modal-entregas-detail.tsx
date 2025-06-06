"use client";
import ModalImportForm from "./modal-import-form";
import CloseModalButton from "../../close-modal-button";
import { FaBoxOpen } from "react-icons/fa6";
import {
  EntregaByFolio,
  EntregasTableByFolio,
  EntregasFiles,
} from "@/app/lib/definitions";
import Link from "next/link";
import { Files } from "./files";
import { formatDate, formatRUT, formatTime } from "@/app/lib/utils/format";
import GetNewFileButton from "./new-file-button";
import DeleteEntregasButton from "./delete-button";
import RoleGuard from "@/app/ui/auth/role-guard";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion"; // Add this import

type Props = {
  rut: string;
  folio: string;
  entregas: EntregasTableByFolio;
  entrega: EntregaByFolio[];
  files: EntregasFiles[];
};

export default function ModalEntregasDetail({
  rut,
  folio,
  entregas,
  entrega,
  files,
}: Props) {
  const [tab, setTab] = useState("Beneficios");
  const { nombre_usuario, fecha_entrega, observacion, estado_documentos } =
    entregas;
  const formattedRUT = formatRUT(rut);

  return (
    <motion.div
      layout
      layoutRoot
      transition={{ layout: { duration: 0.25 } }}
      className="flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-4 overflow-hidden rounded-xl bg-white p-8 shadow-xl transition-all duration-500 scrollbar-hide md:w-[34rem]"
    >
      {/* Header */}
      <section className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-slate-500">Folio</span>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-700">#{folio}</h2>
            <div
              className={`flex items-center gap-2 rounded-md px-2.5 py-0.5 text-sm ${estado_documentos === "Finalizado" ? "bg-slate-100 text-slate-500" : "border border-yellow-100 bg-yellow-50 text-yellow-500"}`}
            >
              {/* <span
                  className={`h-2 w-2 shrink-0 animate-pulse rounded-full ${estado_documentos === "Finalizado" ? "bg-slate-300" : "bg-yellow-400"} `}
                /> */}
              <p className="text-sm">{estado_documentos}</p>
            </div>
          </div>
          <span className="flex gap-1 text-xs text-slate-500">
            Beneficiario: <p className="text-blue-700">{formattedRUT}</p>
          </span>
        </div>
        <CloseModalButton name="detailsModal" secondName="rut" />
      </section>

      {/* Tab Navigation */}
      <section className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("Beneficios")}
          className={`relative px-4 py-2 text-sm font-medium outline-none transition-colors ${
            tab === "Beneficios"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Beneficios
          {tab === "Beneficios" && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"></span>
          )}
        </button>
        <button
          onClick={() => setTab("Importar")}
          className={`relative px-4 py-2 text-sm font-medium outline-none transition-colors ${
            tab === "Importar"
              ? "text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Importar
          {tab === "Importar" && (
            <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"></span>
          )}
        </button>
      </section>

      {/* Content with Framer Motion transitions */}
      <motion.div className="relative min-h-[8rem] overflow-y-auto scrollbar-hide">
        <AnimatePresence mode="wait">
          {tab === "Beneficios" ? (
            <motion.div
              key="beneficios"
              initial={{ opacity: 0, y: 10, height: 460 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 440 }}
              transition={{
                duration: 0.3,
                height: { duration: 0.4 },
              }}
              layout
              className="flex flex-col gap-4"
            >
              {/* General Info */}
              <section className="mt-1 rounded-xl border border-gray-200/80 bg-gray-50/70 p-5">
                <div className="grid grid-cols-2 gap-5">
                  <ModalGeneralInfoField
                    name="Encargado"
                    className="border-r border-gray-200/80 pr-4"
                  >
                    {nombre_usuario}
                  </ModalGeneralInfoField>
                  <ModalGeneralInfoField name="Fecha de Entrega">
                    {fecha_entrega ? fecha_entrega : ""}
                  </ModalGeneralInfoField>
                  <ModalGeneralInfoField
                    span="col-span-2"
                    name="Justificación"
                    className="mt-3 border-t border-gray-200/80 pt-4"
                  >
                    {observacion || "No especificada"}
                  </ModalGeneralInfoField>
                </div>
              </section>

              {/* Entregas List */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    Beneficios Recibidos{" "}
                    {entrega.length > 3 && "(" + entrega.length + ")"}
                  </h3>
                  <RoleGuard allowedRoles={["Administrador", "Supervisor"]}>
                    <DeleteEntregasButton folio={folio} />
                  </RoleGuard>
                </div>
                <div className="flex max-h-[206px] flex-col gap-2.5 overflow-y-auto">
                  {entrega.map((item) => (
                    <EntregasListItem key={item.nombre_campaña} item={item} />
                  ))}
                </div>
              </section>

              {/* Files List */}
              <FilesList folio={folio} files={files} />
            </motion.div>
          ) : (
            <motion.div
              key="importar"
              initial={{ opacity: 0, y: 10, height: 440 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 460 }}
              transition={{
                duration: 0.3,
                height: { duration: 0.4 },
              }}
              layout
              className="flex flex-col gap-5"
            >
              {/* Files List */}
              <FilesList folio={folio} files={files} />

              {/* Import Form */}
              <div className="border-t border-gray-100"></div>
              <ModalImportForm folio={folio} savedFiles={files.length} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function ModalGeneralInfoField({
  name,
  children,
  span,
  className,
}: {
  name: string;
  children: string | Date;
  span?: string;
  className?: string;
}) {
  const value = typeof children === "string" ? children : formatDate(children);
  const hour = typeof children === "object" ? formatTime(children) : "";

  return (
    <div className={`${span} ${className || ""}`}>
      <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
        {name}
      </p>
      <span className="flex items-baseline gap-2">
        <p className="mt-1 text-sm text-slate-700">{value}</p>
        {typeof children === "object" && (
          <p className="text-xs text-slate-500">{hour}</p>
        )}
      </span>
    </div>
  );
}

function EntregasListItem({ item }: { item: EntregaByFolio }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200/80 bg-gray-50 px-3 py-2.5 transition-colors hover:bg-gray-100/80">
      <div className="flex items-center gap-3">
        <Link
          className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm transition-all hover:bg-blue-100 hover:shadow"
          href={`/dashboard/campanas/${item.id_campaña}`}
        >
          <FaBoxOpen className="h-5 w-5 text-slate-700 transition-all group-hover:text-blue-500" />
        </Link>

        <div>
          <h3 className="text-sm font-semibold text-slate-700">
            {item.nombre_campaña}
          </h3>
          <p className="w-full max-w-[180px] overflow-hidden text-ellipsis text-nowrap text-xs text-slate-500">
            {item.id_campaña}
          </p>
        </div>
      </div>
      <div className="px-1">
        <h4 className="text-right text-xs text-slate-500">{item.tipo_dato}</h4>
        <p className="text-right text-sm font-semibold text-slate-700">
          {item.detalle}
        </p>
      </div>
    </div>
  );
}

function FilesList({
  folio,
  files,
}: {
  folio: string;
  files: EntregasFiles[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
          Documentos Adjuntos
        </h3>

        <GetNewFileButton folio={folio}>Nueva Acta</GetNewFileButton>
      </div>

      {files.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-200/80 bg-gray-50/70 p-4 shadow-sm">
          {files.map((item: EntregasFiles, index) => (
            <Files key={index} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-sm text-gray-400">
          <svg
            className="h-10 w-10 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No hay documentos adjuntos</p>
        </div>
      )}
    </div>
  );
}
