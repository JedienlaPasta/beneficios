import { fetchActiveCampaigns } from "@/app/lib/data/campanas";
import NewEntregaModal from "./NewEntregaModal";
import { getSession } from "@/app/lib/session";

type NewEntregaModalContextProps = {
  rut: string;
};

export default async function NewEntregaModalContext({
  rut,
}: NewEntregaModalContextProps) {
  const response = await fetchActiveCampaigns();

  const userSession = await getSession();
  if (!userSession?.userId) {
    return null;
  }
  const userId = String(userSession?.userId);

  return (
    <>
      <NewEntregaModal rut={rut} userId={userId} activeCampaigns={response} />
    </>
  );
}
