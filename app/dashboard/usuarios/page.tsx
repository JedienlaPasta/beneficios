import { Suspense } from "react";
import { UsersTable } from "@/app/ui/dashboard/usuarios/users-table";
import PageHeader from "@/app/ui/dashboard/page-header";
import { getUsers } from "@/app/lib/data/users";
import { UserTableSkeleton } from "@/app/ui/dashboard/usuarios/skeletons";
import { CreateUserButton } from "@/app/ui/dashboard/usuarios/create-user-button";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="">
      <PageHeader
        title="Gestión de Usuarios"
        description="Administra las cuentas de usuario del sistema."
      >
        <CreateUserButton />
      </PageHeader>

      <div className="flex flex-col gap-6 rounded-xl 3xl:w-[96rem] 3xl:justify-self-center">
        <Suspense fallback={<UserTableSkeleton />}>
          <UsersTable users={users} />
        </Suspense>
      </div>
    </div>
  );
}
