import { ReactNode } from "react";
import DashboardLayoutClient from "../ui/dashboard/dashboard-layout-client";
import Breadcrumbs from "../ui/dashboard/breadcrumbs";
import { getSession } from "../lib/session";
import { getUserData } from "../lib/data/usuario";

export default async function Layout({ children }: { children: ReactNode }) {
  const userSession = await getSession();
  let userData = {
    id: "",
    nombre_usuario: "",
    correo: "",
    cargo: "",
    rol: "",
    estado: "",
  };

  if (userSession?.userId) {
    userData = await getUserData(String(userSession.userId));
  }

  return (
    <DashboardLayoutClient userData={userData}>
      <Breadcrumbs />
      <div className="w-full">{children}</div>
    </DashboardLayoutClient>
  );
}
