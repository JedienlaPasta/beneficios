import ModalForm from "./entregas-modal-form";
import CloseModalButton from "../../close-modal-button";
import {
  fetchSocialAidsGeneralInfoByFolio,
  fetchSocialAidsInfoByFolio,
} from "@/app/lib/data/entregas";

export default async function EntregasTableModal({ folio }: { folio: string }) {
  const entregasResponse = await fetchSocialAidsGeneralInfoByFolio(folio);
  const { nombre_usuario, fecha_entrega, observacion } =
    entregasResponse.data[0];
  const entregaResponse = await fetchSocialAidsInfoByFolio(folio);
  const { detalle, nombre_campaña } = entregaResponse.data[0];

  const fecha = fecha_entrega.toString().split(" ");
  const formattedDate = fecha[2] + " " + fecha[1] + ", " + fecha[3];

  return (
    <div className="grid max-h-dvh min-w-[26rem] max-w-[30rem] shrink-0 flex-col gap-4 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="text font-medium text-slate-600">
            Beneficios Recibidos
          </h2>
          <CloseModalButton />
        </div>
        <h3 className="text-xl font-bold text-slate-700">#{folio}</h3>
        <div className="col-span-2 mt-2 grid gap-4">
          <DataField span="col-span-1" name={"Encargado"}>
            {nombre_usuario}
          </DataField>
          <DataField span="col-span-1" name={"Fecha Entrega"}>
            {formattedDate}
          </DataField>
          <DataField span="col-span-2" name={"Observaciones"}>
            {observacion}
          </DataField>
        </div>
      </div>
      <button className="rounded-md bg-blue-500 px-2 py-2 text-white">
        Descargar Acta
      </button>
      <ModalForm />
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
      <p className="text-xs uppercase text-slate-600">{name}</p>
      <p className="text-slate-700">{children}</p>
    </div>
  );
}
