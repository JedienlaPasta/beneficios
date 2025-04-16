import { JSX } from "react";
import { fetchDailyEntregasCountByYear } from "@/app/lib/data/inicio";
import { getDaysBetween } from "@/app/lib/utils/get-values";
import BoardCube from "./heatmap-board-cube";

type HeatMapTableProps = {
  year: string;
};

export default async function HeatMapTable({ year }: HeatMapTableProps) {
  const entregas = await fetchDailyEntregasCountByYear(year);
  console.log(year);
  const weekDays = ["Lun", "Mar", "Mie", "Jue", "Vie"];
  const boardDays = weekDays.map((day) => <p key={day}>{day}</p>);

  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];

  function calculateThresholds(data: number[]): number[] {
    const sorted = [...data].sort((a, b) => a - b);
    const percentiles = [0.2, 0.4, 0.6, 0.8];
    return percentiles.map((p) => {
      const idx = Math.floor(p * sorted.length);
      return sorted[idx];
    });
  }

  const counts = Object.values(entregas).filter(
    (value) => typeof value === "number",
  ) as number[];

  const thresholds =
    counts.length > 0 ? calculateThresholds(counts) : [0, 1, 2, 3];

  // days now includes 2025-12-31 thanks to our fix.
  const days = getDaysBetween("2025-01-01", "2025-12-31");
  const filteredDays = days.filter((day) => day.year() === 2025);

  // Build weeks array (each week has exactly 5 elements)
  const weeks: Array<JSX.Element[]> = [];
  let currentWeek: JSX.Element[] = [];

  // Determine the offset for the first workday (Mon-Fri)
  const firstWorkdayIndex = filteredDays.findIndex((day) => {
    const dayOfWeek = day.day();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  });
  const firstWorkDay = filteredDays[firstWorkdayIndex];
  const dayOfWeek = firstWorkDay.day();
  const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Pre-pad the first week with disabled cubes.
  for (let i = 0; i < offset; i++) {
    currentWeek.push(<BoardCube key={`offset-${i}`} count={0} disabled />);
  }

  filteredDays.forEach((day) => {
    const dOW = day.day();
    if (dOW >= 1 && dOW <= 5) {
      const dateStr = day.format("YYYY-MM-DD");
      const count = entregas[dateStr] || 0;
      currentWeek.push(
        <BoardCube
          key={dateStr}
          count={count}
          dateStr={dateStr}
          thresholds={thresholds}
        />,
      );

      if (currentWeek.length === 5) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }
  });

  // Pad final week if needed once only.
  if (currentWeek.length > 0) {
    const pad = 5 - currentWeek.length;
    for (let i = 0; i < pad; i++) {
      currentWeek.push(<BoardCube key={`final-pad-${i}`} count={0} disabled />);
    }
    weeks.push(currentWeek);
  }

  console.log(
    "Last day in filteredDays:",
    filteredDays.at(-1)?.format("YYYY-MM-DD"),
  );

  return (
    <div className="flex w-fit flex-col rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="ml-7 grid grid-cols-12 pb-1 text-xs text-gray-600">
        {months.map((month) => (
          <div key={month} className="whitespace-nowrap text-center">
            {month}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col gap-1 text-center text-xs text-gray-600">
          {boardDays}
        </div>
        <div className="grid grid-flow-col grid-rows-5 gap-1">
          {weeks.flat()}
        </div>
      </div>
    </div>
  );
}
