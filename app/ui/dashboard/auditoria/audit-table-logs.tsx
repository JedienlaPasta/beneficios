import { fetchActivity } from "@/app/lib/data/auditoria";
import AuditTable from "../audit-table";

export async function AuditLogsTable({
  currentPage,
  query,
}: {
  currentPage: number;
  query: string;
}) {
  const { data, total } = await fetchActivity(query, currentPage, 8);

  return <AuditTable logs={data} totalPages={total} />;
}
