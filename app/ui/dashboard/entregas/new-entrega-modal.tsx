import { fetchActiveCampaigns } from "@/app/lib/data/campañas";
import CloseModalButton from "../close-modal-button";
import NewModalForm from "./new-modal-form";
import { getSession } from "@/app/lib/session";

type NewEntregaModalProps = {
  rut: string;
};

export default async function NewEntregaModal({ rut }: NewEntregaModalProps) {
  const response = await fetchActiveCampaigns();

  const userSession = await getSession();
  if (!userSession?.userId) {
    return null;
  }
  const userId = String(userSession?.userId);

  return (
    <div className="flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-3 overflow-hidden rounded-xl bg-white p-8 shadow-xl">
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

      <div className="overflow-y-auto scrollbar-hide">
        <div className="mt-2 border-t border-slate-100 pt-4">
          <NewModalForm
            activeCampaigns={response.data}
            rut={rut}
            userId={userId}
          />
        </div>
      </div>
    </div>
  );
}
