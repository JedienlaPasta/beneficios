import { fetchRSHCount } from "@/app/lib/data/rsh";
import { formatNumber } from "@/app/lib/utils/format";

export async function RSHRegistrosCount() {
  const { total_registros } = await fetchRSHCount();

  return (
    <p
      className={` ${total_registros ? "text-3xl font-bold text-blue-600" : "mt-1 text-xs text-slate-500"}`}
    >
      {total_registros ? formatNumber(total_registros) : "No hay registros"}
    </p>
  );
}
