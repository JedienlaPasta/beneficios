import ModalForm from "./entregas-modal-form";
import CloseModalButton from "../../close-modal-button";
import { FaBoxOpen } from "react-icons/fa6";

import {
  fetchFilesByFolio,
  fetchSocialAidsGeneralInfoByFolio,
  fetchSocialAidsInfoByFolio,
} from "@/app/lib/data/entregas";
import { SocialAidByFolio, SocialFiles } from "@/app/lib/definitions";
import Link from "next/link";
import { Files } from "./files";
import { formatDate, formatTime } from "@/app/lib/utils/format";
import GetNewFileButton from "./new-file-button";
import DeleteEntregasButton from "./delete-button";
import RoleGuard from "@/app/ui/auth/role-guard";

export default async function EntregasTableModal({ folio }: { folio: string }) {
  const entregasResponse = await fetchSocialAidsGeneralInfoByFolio(folio);
  const { nombre_usuario, fecha_entrega, observacion, estado_documentos } =
    entregasResponse.data[0];
  const entregaResponse = await fetchSocialAidsInfoByFolio(folio);
  const files = await fetchFilesByFolio(folio);

  const estadoTextColor =
    estado_documentos === "Finalizado"
      ? "bg-blue-100 text-blue-500"
      : "bg-orange-100/80 text-orange-500/70";
  const estadoDotColor =
    estado_documentos === "Finalizado" ? "bg-blue-300" : "bg-orange-300";

  return (
    <div className="relative grid max-h-dvh w-[30rem] max-w-full shrink-0 flex-col gap-5 overflow-y-auto rounded-xl bg-white p-8 shadow-xl md:w-[38rem]">
      <div className="flex flex-col gap-4">
        <section className="flex items-center justify-between border-b border-gray-200/80 pb-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-500">Folio</span>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-700">#{folio}</h2>
              <div
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 ${estadoTextColor} shadow-sm`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${estadoDotColor} animate-pulse`}
                ></span>
                <p className="text-sm font-medium">{estado_documentos}</p>
              </div>
            </div>
          </div>
          <CloseModalButton name="detailsModal" folio={folio} />
        </section>

        <section className="mt-1 rounded-xl border border-gray-200/80 bg-gray-50/70 p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-5">
            <DataField
              name="Encargado"
              className="border-r border-gray-200/80 pr-4"
            >
              {nombre_usuario}
            </DataField>
            <DataField name="Fecha de Entrega">
              {fecha_entrega ? fecha_entrega : ""}
            </DataField>
            <DataField
              span="col-span-2"
              name="Justificación"
              className="mt-3 border-t border-gray-200/80 pt-4"
            >
              {observacion || "No especifica."}
            </DataField>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Beneficios Recibidos
            </h3>
            <RoleGuard allowedRoles={["Administrador"]}>
              <DeleteEntregasButton folio={folio} />
            </RoleGuard>
          </div>
          <div className="flex flex-col gap-2.5">
            {entregaResponse.data.map((item) => (
              <EntregasItem key={item.nombre_campaña} item={item} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
              Documentos Adjuntos
            </h3>

            <GetNewFileButton folio={folio}>Nueva Acta</GetNewFileButton>
          </div>

          {files.data.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 rounded-xl border border-gray-200/80 bg-gray-50/70 p-4 shadow-sm">
              {files.data.map((item: SocialFiles, index) => (
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
        </section>
      </div>

      <div className="mt-2 border-t border-gray-100 pt-5">
        <ModalForm folio={folio} savedFiles={files.data.length} />
      </div>
    </div>
  );
}

function DataField({
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

function EntregasItem({ item }: { item: SocialAidByFolio }) {
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
