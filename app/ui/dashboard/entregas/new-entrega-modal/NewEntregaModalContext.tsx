import { getActiveCampaignsForEntregas } from "@/app/lib/data/campanas";
import NewEntregaModal from "./NewEntregaModal";
import { getSession } from "@/app/lib/session";
import { cookies } from "next/headers";

type NewEntregaModalContextProps = {
  rut: string;
};

export default async function NewEntregaModalContext({
  rut,
}: NewEntregaModalContextProps) {
  const response = await getActiveCampaignsForEntregas();

  const userSession = await getSession();
  if (!userSession?.userId) {
    return null;
  }
  const userId = String(userSession?.userId);

  const cookieStore = await cookies();
  const userRoleCookie = cookieStore.get("userRole");
  let userRole = "";

  if (userRoleCookie) {
    try {
      const parsed = JSON.parse(userRoleCookie.value);
      userRole = parsed.rol || "";
    } catch (error) {
      console.error("Error parsing userRole cookie:", error);
    }
  }

  return (
    <>
      <NewEntregaModal
        rut={rut}
        userId={userId}
        activeCampaigns={response}
        userRole={userRole}
      />
    </>
  );
}
