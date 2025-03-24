// "use client";
import { Campaign } from "@/app/lib/definitions";
import UpdateForm from "./update-form";
// import { RiCloseLine } from "react-icons/ri";
// import { useRouter } from "next/navigation";
import CloseModalButton from "../../../close-modal-button";

export default function UpdateCampaignModal({
  id,
  data,
}: {
  id: string;
  data: Campaign[];
}) {
  // const router = useRouter();

  return (
    <div className="w-full max-w-[36rem] shrink-0 text-slate-900">
      <div className="grid max-h-dvh overflow-y-auto rounded-xl bg-white p-8">
        <div>
          <span className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Actualizar Campaña</h2>
            <CloseModalButton name="update" />
          </span>
          {/* <p className="text-sm text-slate-600/70">
            Cuidado con los datos a cambiar, esta acción es irreversible.
          </p> */}
        </div>
        <span className="flex items-center gap-2.5 pb-1">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-lg text-white">
            {data[0].descripcion}
          </span>
          <div>
            <span className="flex items-baseline gap-[2px] rounded-md bg-blue-100 px-2 py-1">
              <p className="text-xs font-medium text-slate-800">ID</p>
              <p className="text-xs font-medium text-blue-500">#{id}</p>
            </span>
            <p className="text-lg font-medium tracking-tight text-slate-700">
              {data[0].nombre}
            </p>
          </div>
        </span>
        <UpdateForm data={data} />
      </div>
    </div>
  );
}
