import { fetchRSHLastUpdate } from "@/app/lib/data/rsh";
import { formatDate } from "@/app/lib/utils/format";

export async function RSHLastUpdated() {
  const { data } = await fetchRSHLastUpdate();

  const lastUpdated = data[0]?.ultima_actualizacion
    ? formatDate(data[0].ultima_actualizacion)
    : "No hay datos asociados";

  return (
    <span className="mt-1 flex items-center text-xs text-slate-500">
      <svg
        className="mr-1 h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      {lastUpdated}
    </span>
  );
}
