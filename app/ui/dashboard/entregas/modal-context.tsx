import { fetchActiveCampaigns } from "@/app/lib/data/campañas";
import NewEntregaModal from "./new-modal";
import { getSession } from "@/app/lib/session";
import { EntregasTable } from "@/app/lib/definitions";

type NewEntregaModalContextProps = {
  rut: string;
  entregas: EntregasTable[];
};

export default async function NewEntregaModalContext({
  rut,
  entregas,
}: NewEntregaModalContextProps) {
  const response = await fetchActiveCampaigns();

  const userSession = await getSession();
  if (!userSession?.userId) {
    return null;
  }
  const userId = String(userSession?.userId);

  return (
    <>
      <NewEntregaModal
        rut={rut}
        userId={userId}
        activeCampaigns={response}
        entregas={entregas}
      />
    </>
  );
}
