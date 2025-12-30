import { Suspense } from "react";
import PageHeader from "@/app/ui/dashboard/PageHeader";
import { CreateUserButton } from "@/app/ui/dashboard/usuarios/CreateUserButton";
import UsersTableWrapper from "@/app/ui/dashboard/usuarios/UsersTableWrapper";
import { Users } from "lucide-react";
import { UserTableSkeleton } from "@/app/ui/dashboard/usuarios/Skeletons";

export default async function UsersPage() {
  return (
    <div className="">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra las cuentas de usuario del sistema."
      >
        <CreateUserButton />
      </PageHeader>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 shadow-md shadow-slate-300/70">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4 md:px-6 3xl:w-[96rem] 3xl:self-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-700/10">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-800">
                Usuarios Registrados
              </h2>
              <p className="-mt-0.5 text-xs font-medium text-slate-500">
                Listado completo de usuarios
              </p>
            </div>
          </div>
        </div>
        <Suspense fallback={<UserTableSkeleton />}>
          <UsersTableWrapper />
        </Suspense>
      </div>
    </div>
  );
}
