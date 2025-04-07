import { fetchActiveCampaigns } from "@/app/lib/data/campañas";
import CloseModalButton from "../close-modal-button";
import NewModalForm from "./new-modal-form";

type NewSocialAidModalProps = {
  rut: string;
};

export default async function NewSocialAidModal({
  rut,
}: NewSocialAidModalProps) {
  const response = await fetchActiveCampaigns();

  return (
    <div className="grid max-h-dvh max-w-[30rem] shrink-0 flex-col gap-3 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            Asignar Beneficios
          </h2>
        </div>
        <CloseModalButton name="newsocialaid" />
      </div>
      <p className="text-xs text-slate-500">
        Elige los beneficios que vas a asignar junto con sus respectivos datos.
      </p>

      <div className="mt-2 border-t border-slate-100 pt-4">
        <NewModalForm activeCampaigns={response.data} rut={rut} />
      </div>
    </div>
  );
}
