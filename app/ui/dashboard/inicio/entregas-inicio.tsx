import clsx from "clsx";
import { Suspense } from "react";

export default function TableroEntregasInicio() {
  const recuadros = [];
  for (let i = 0; i < 240; i++) {
    recuadros.push(<RecuadroTablero index={i + 1} />);
  }

  return (
    <div className="grid w-fit grid-flow-col grid-rows-5 gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <Suspense fallback={<div className="h-full w-full"></div>}>
        {recuadros}
      </Suspense>
    </div>
  );
}

function RecuadroTablero({ index }: { index: number }) {
  const randomStateNumber = Math.ceil((Math.random() * 100) / 20) - 1;
  const colorEstado = [
    "bg-green-400 border-green-600",
    "bg-green-300 border-green-500",
    "bg-green-200 border-green-400",
    "bg-green-100 border-green-300",
    "bg-slate-100 border-slate-200",
  ];
  // flex h-4 w-4 items-center justify-center rounded border border-green-600 bg-green-400
  return (
    <div
      key={index * randomStateNumber}
      className={`flex h-4 w-4 items-center justify-center rounded border ${clsx(colorEstado[randomStateNumber])}`}
    ></div>
  );
}
