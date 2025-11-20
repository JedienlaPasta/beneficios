import { FiBox } from "react-icons/fi";

export default function EntregasStockSummary({
  entregas,
  period,
}: {
  entregas: number | string;
  period: string;
}) {
  return (
    <div className="group relative flex min-w-64 flex-1 flex-col overflow-hidden rounded-xl border bg-white hover:border-slate-300 hover:bg-slate-200/80">
      <div className="flex h-14 items-center justify-between px-7">
        <div className="flex items-center justify-start gap-3 text-slate-700">
          <FiBox className="text-xl text-blue-500 transition-all duration-500 group-hover:scale-125" />
          <p className="text-xl font-bold">{entregas}</p>
        </div>
        <span className="text-slate-600">{period}</span>
      </div>
    </div>
  );
}
