import { fetchUserActivityById } from "@/app/lib/data/auditoria";
import AuditTable from "../audit-table";
import { getSession } from "@/app/lib/session";

export async function AuditLogsTable({
  currentPage,
  query,
}: {
  currentPage: number;
  query: string;
}) {
  const userSession = await getSession();
  if (!userSession) {
    return null;
  }
  const userId = String(userSession.userId);
  const { data, pages } = await fetchUserActivityById(
    userId,
    query,
    currentPage,
    5,
  );

  return (
    <>
      <AuditTable logs={data} pages={pages} />
    </>
  );
}
