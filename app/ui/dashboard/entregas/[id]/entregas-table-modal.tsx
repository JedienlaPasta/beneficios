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

export default async function EntregasTableModal({ folio }: { folio: string }) {
  const entregasResponse = await fetchSocialAidsGeneralInfoByFolio(folio);
  const { nombre_usuario, fecha_entrega, observacion } =
    entregasResponse.data[0];
  const entregaResponse = await fetchSocialAidsInfoByFolio(folio);
  const files = await fetchFilesByFolio(folio);

  const fecha = fecha_entrega.toString().split(" ");
  const formattedDate = fecha[2] + " " + fecha[1] + ", " + fecha[3];

  return (
    <div className="grid max-h-dvh w-[30rem] max-w-[100%] shrink-0 flex-col gap-4 overflow-y-auto rounded-xl bg-white p-10 shadow-xl">
      <div className="flex flex-col gap-4">
        <section className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xl font-bold text-slate-700">#{folio}</h2>
          <CloseModalButton />
        </section>

        <section className="grid grid-cols-2 gap-5">
          <DataField name="Encargado">{nombre_usuario}</DataField>
          <DataField name="Entrega">{formattedDate}</DataField>
          <DataField span="col-span-2" name="Justificación">
            {observacion || "No especifica."}
          </DataField>
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
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3">
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

      <div className="mt-2 border-t border-gray-100 pt-4">
        <ModalForm folio={folio} />
      </div>
    </div>
  );
}

function DataField({
  name,
  children,
  span,
}: {
  name: string;
  children: React.ReactNode;
  span?: string;
}) {
  return (
    <div className={`${span} `}>
      <p className="text-sm text-slate-500">{name}</p>
      <p className="text-slate-700">{children}</p>
    </div>
  );
}

function EntregasItem({ item }: { item: SocialAidByFolio }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-gray-100/60 px-3 py-2.5 transition-colors hover:bg-gray-100/80">
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

// function Files({ item }: { item: SocialFiles }) {
//   return (
//     <div className="flex cursor-pointer flex-col items-center justify-center rounded-md bg-white p-3 shadow-sm transition-shadow hover:shadow">
//       <Image className="mb-1 h-8 w-8" src={pdf} alt="pdf.img" />
//       <span className="w-full truncate text-center text-xs font-medium text-slate-700">
//         {item.nombre_documento || "Documento"}
//       </span>
//       <span className="text-center text-[10px] text-slate-500">
//         {item.tipo || ".pdf"}
//       </span>
//     </div>
//   );
// }
