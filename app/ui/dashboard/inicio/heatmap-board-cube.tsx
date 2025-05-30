import clsx from "clsx";
import dayjs from "dayjs";

type BoardCubeProps = {
  count: number;
  dateStr?: string;
  thresholds?: number[];
  disabled?: boolean;
};

export default function BoardCube({
  count,
  dateStr,
  thresholds = [],
  disabled = false,
}: BoardCubeProps) {
  const today = dayjs().format("YYYY-MM-DD");
  const isToday = dateStr === today;

  const stateColor = [
    "bg-slate-200/60 border-slate-300/60",
    "bg-green-100/80 border-green-300/80",
    "bg-green-100 border-green-300",
    "bg-green-200 border-green-400",
    "bg-green-300 border-green-500",
    "bg-green-400 border-green-600",
  ];

  // Select the color based on count thresholds—or highlight if today.
  function getStateFromCount(count: number, thresholds: number[]): number {
    if (count === 0) return 0;
    if (count <= thresholds[0]) return 1;
    if (count <= thresholds[1]) return 2;
    if (count <= thresholds[2]) return 3;
    if (count <= thresholds[3]) return 4;
    return 5;
  }

  const cubeClass = disabled
    ? "bg-slate-50 border-slate-200/90"
    : stateColor[getStateFromCount(count, thresholds)];
  // const cubeClass = disabled
  //   ? "bg-slate-50 border-slate-200/90"
  //   : isToday
  //     ? "bg-green-300 border-blue-blue-400"
  //     : stateColor[getStateFromCount(count, thresholds)];

  const year = dateStr?.slice(0, 4);
  const day = dateStr?.slice(8);
  const month = dateStr?.slice(5, 7);
  const date = `${day}-${month}-${year}`;

  return (
    <div
      className={`group relative flex h-4 w-4 items-center justify-center rounded border ${clsx(
        cubeClass,
      )}`}
    >
      {isToday && (
        <span
          className={`group relative flex size-2 items-center justify-center rounded-[2px] border !bg-green-100 ${clsx(cubeClass)}`}
        ></span>
      )}
      {!disabled && (
        <div className="absolute bottom-5 z-10 hidden flex-col whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
          <p>{date}</p>
          <p>Entregas: {count}</p>
        </div>
      )}
    </div>
  );
}
