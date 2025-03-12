import { fetchCampaignById } from "@/app/lib/data/data";
import UpdateCampaignModal from "@/app/ui/dashboard/campañas/[id]/update/update-campaign-modal";

export default async function UpdateCampaign(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const { id } = params;
  const { data } = await fetchCampaignById(id);

  return (
    <div className="flex flex-col">
      <UpdateCampaignModal id={id} data={data} />
    </div>
  );
}
