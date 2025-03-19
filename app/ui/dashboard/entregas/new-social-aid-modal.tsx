import { fetchActiveCampaigns } from "@/app/lib/data/campañas";
import CloseModalButton from "../close-modal-button";
import NewModalForm from "./new-modal-form";
import { RSH } from "@/app/lib/definitions";

type NewSocialAidModalProps = {
  data: RSH[];
};

export default async function NewSocialAidModal({
  data,
}: NewSocialAidModalProps) {
  const activeCampaigns = (await fetchActiveCampaigns()).data;

  return (
    // <div className="flex max-h-dvh w-dvw shrink-0 justify-center overflow-y-auto bg-white px-10 py-8">
    <div className="grid max-h-dvh max-w-[30rem] shrink-0 flex-col gap-3 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      {/* <div className="w-[1024px]"> */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Asignar Beneficios</h2>
        <CloseModalButton name="newsocialaid" />
      </div>
      <p className="text-xs text-gray-500">
        Elige los beneficios que vas asignar junto con sus respectivos datos.
      </p>
      <NewModalForm activeCampaigns={activeCampaigns} data={data} />
      {/* </div> */}
    </div>
  );
}
