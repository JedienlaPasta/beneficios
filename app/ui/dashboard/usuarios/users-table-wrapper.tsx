import { getUsers } from "@/app/lib/data/users";
import { UsersTable } from "./users-table";

export default async function UsersTableWrapper() {
  const users = await getUsers();

  return <UsersTable users={users} />;
}
