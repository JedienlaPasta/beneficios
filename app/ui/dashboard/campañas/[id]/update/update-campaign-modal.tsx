import UpdateForm from "./update-form";
import CloseModalButton from "../../../close-modal-button";
import { fetchCampaignById } from "@/app/lib/data/campanas";

export default async function UpdateCampaignModal({ id }: { id: string }) {
  const response = await fetchCampaignById(id);

  return (
    <div className="z-50 flex max-h-full w-[32rem] max-w-full shrink-0 flex-col overflow-hidden rounded-xl bg-white p-8 text-slate-900">
      <span className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Actualizar Campaña</h2>
        <CloseModalButton name="update" />
      </span>
      <span className="flex items-center gap-2.5 pb-1">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-lg text-white">
          {response.code}
        </span>
        <div>
          <span className="flex items-baseline gap-[2px] rounded-md bg-blue-100 px-2 py-1">
            <p className="text-xs font-medium text-slate-800">ID</p>
            <p className="text-xs font-medium text-blue-500">#{id}</p>
          </span>
          <p className="text-lg font-medium tracking-tight text-slate-700">
            {response.nombre_campaña}
          </p>
        </div>
      </span>
      <div className="overflow-y-auto scrollbar-hide">
        <UpdateForm data={response} />
      </div>
    </div>
  );
}
