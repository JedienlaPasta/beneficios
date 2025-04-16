import { fetchRSHCount } from "@/app/lib/data/rsh";
import { formatNumber } from "@/app/lib/utils/format";

export async function RSHRegistrosCount() {
  const { data } = await fetchRSHCount();

  return (
    <p
      className={` ${data[0]?.total_registros ? "text-3xl font-bold text-blue-600" : "mt-1 text-xs text-slate-500"}`}
    >
      {data[0]?.total_registros
        ? formatNumber(data[0].total_registros)
        : "No hay registros"}
    </p>
  );
}
