import clsx from "clsx";
import { JSX } from "react";
import outputData from "@/app/lib/data/output.json";

export default function HeatMapTable() {
  const board: Array<JSX.Element> = [];
  outputData.forEach((item) => {
    board.push(<BoardCube key={item.index} state={item.state} />);
  });

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
  const mesesTablero = months.map((month) => (
    <p className="w-8" key={month}>
      {month}
    </p>
  ));

  return (
    <div className="items-centers flex w-fit flex-col justify-center rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="bg-slate-300s ml-7 flex gap-12 pb-1 text-xs text-gray-600">
        {mesesTablero}
      </div>
      <div className="flex items-center justify-center gap-2">
        <div className="flex flex-col gap-1 text-center text-xs text-gray-600">
          {boardDays}
        </div>
        <div className="bg-slate-800s grid w-fit grid-flow-col grid-rows-5 gap-1">
          {board}
        </div>
      </div>
    </div>
  );
}

function BoardCube({ state }: { state: number }) {
  const stateColor = [
    "bg-slate-100 border-slate-200",
    "bg-green-100 border-green-300",
    "bg-green-200 border-green-400",
    "bg-green-300 border-green-500",
    "bg-green-400 border-green-600",
  ];

  return (
    <div
      className={`group relative flex h-4 w-4 items-center justify-center rounded border ${clsx(stateColor[state - 1])}`}
    >
      <div className="absolute bottom-5 z-10 hidden text-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex">
        Entregas: +{(state - 1) * 2}
      </div>
    </div>
  );
}
