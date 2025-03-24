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
import { formatDate } from "@/app/lib/utils";

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
    <div className="relative grid max-h-dvh w-[34rem] max-w-full shrink-0 flex-col gap-4 overflow-y-auto rounded-xl bg-white p-10 shadow-xl">
      <div className="flex flex-col gap-4">
        <section className="flex items-center justify-between border-b border-gray-200/80 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-700">#{folio}</h2>
            <div
              className={`flex items-center gap-2 rounded-md px-3 py-1 ${estadoTextColor} shadow-sm`}
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${estadoDotColor} animate-pulse`}
              ></span>
              <p className="text-sm">{estado_documentos}</p>
            </div>
          </div>
          <CloseModalButton name="detailsModal" folio={folio} />
        </section>

        <section className="rounded-lg border border-gray-200/80 bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-5">
            <DataField
              name="Encargado"
              className="border-r border-gray-200/80 pr-4"
            >
              {nombre_usuario}
            </DataField>
            <DataField name="Entrega">
              {fecha_entrega ? fecha_entrega : ""}
            </DataField>
            <DataField
              span="col-span-2"
              name="Justificación"
              className="mt-2 border-t border-gray-200/80 pt-4"
            >
              {observacion || "No especifica."}
            </DataField>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-slate-500">
            Beneficios Recibidos
          </h3>
          <div className="flex flex-col gap-2">
            {entregaResponse.data.map((item) => (
              <EntregasItem key={item.nombre_campaña} item={item} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">
              Documentos Adjuntos
            </h3>
            <button className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100 active:scale-95">
              Nueva Acta
            </button>
          </div>

          {files.data.length > 0 ? (
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-gray-200/80 bg-gray-50 p-3">
              {files.data.map((item: SocialFiles, index) => (
                <Files key={index} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 text-sm text-gray-400">
              No hay documentos adjuntos
            </div>
          )}
        </section>
      </div>

      <div className="mt-1 border-t border-gray-100 pt-4">
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
  let displayValue;
  let hora;
  if (!children) displayValue = "";
  else if (typeof children === "string") displayValue = children;
  else if (typeof children === "object") {
    displayValue = formatDate(children);
    hora = children.toString().split(" ")[4];
  } else displayValue = children;

  return (
    <div className={`${span} ${className || ""}`}>
      <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
        {name}
      </p>
      <span className="flex items-baseline gap-2">
        <p className="mt-1 text-slate-700">{displayValue}</p>
        {typeof children === "object" && (
          <p className="text-xs text-slate-500">{hora}</p>
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
