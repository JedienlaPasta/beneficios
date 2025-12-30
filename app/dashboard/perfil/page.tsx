import { getUserById } from "@/app/lib/data/users";
import { getSession } from "@/app/lib/session";
import UserProfile from "@/app/ui/dashboard/perfil/Profile";

export default async function ProfilePage() {
  const userSession = await getSession();
  if (!userSession) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Cargando información de perfil...</p>
      </div>
    );
  }

  const userData = await getUserById(String(userSession?.userId));
  if (!userData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">
          No se pudo cargar la información del usuario.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-800">
        Perfil de Usuario
      </h1>
      <UserProfile userData={userData} />
    </div>
  );
}
