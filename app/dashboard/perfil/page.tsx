import UserProfile from "@/app/ui/dashboard/perfil/profile";
import { cookies } from "next/headers";

export default async function ProfilePage() {
  const cookiesInstance = await cookies();
  const userSessionCookie = cookiesInstance.get("userSession");

  const parsedUserSession = userSessionCookie?.value
    ? JSON.parse(userSessionCookie?.value)
    : null;

  if (!userSessionCookie?.value) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Cargando información de perfil...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        Perfil de Usuario
      </h1>

      <UserProfile userSession={parsedUserSession} />
    </div>
  );
}
