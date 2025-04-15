import HeatInfo from "./heatmap-heat-info";
import HeatMapTable from "./heatmap-table";
import HeatMapFilter from "./heatmap-filter";
import { Suspense } from "react";

type HeatmapProps = {
  year: string;
};

export default async function HeatMap({ year }: HeatmapProps) {
  const currentYear = new Date().getFullYear().toString();

  return (
    <div className="borders flex flex-col justify-center gap-4 overflow-x-auto rounded-xl border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex items-start justify-between">
        <h2 className="text-xl font-semibold text-slate-800">
          Entregas Realizadas
        </h2>
      </div>

      <div className="flex min-w-fit shrink-0 flex-nowrap gap-6 border-t border-slate-100 pt-4">
        <div className="flex-1">
          <div className="flex flex-col gap-3">
            <Suspense fallback={<p>asdasdasd...</p>}>
              <HeatMapTable year={year} />
            </Suspense>
            <HeatInfo />
          </div>
        </div>

        <div className="w-full">
          <HeatMapFilter currentYear={currentYear} />
        </div>
      </div>
    </div>
  );
}
