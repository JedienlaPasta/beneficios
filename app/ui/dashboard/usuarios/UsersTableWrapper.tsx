import { getUsers } from "@/app/lib/data/users";
import { UsersTable } from "./UsersTable";

export default async function UsersTableWrapper() {
  const users = await getUsers();

  return <UsersTable users={users} />;
}
