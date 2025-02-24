import clsx from "clsx";
import { JSX } from "react";
import outputData from "@/app/data/output.json";

export default function TableroEntregasInicio() {
  const recuadros: Array<JSX.Element> = [];
  outputData.forEach(item => {
    recuadros.push(<RecuadroTablero key={item.index} estado={item.estado} />);
  });

  return (
    <div className="grid w-fit grid-flow-col grid-rows-5 gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        {recuadros}
    </div>
  );
}

function RecuadroTablero({ estado }: { estado: number }) {
  const colorEstado = [
    "bg-slate-100 border-slate-200",
    "bg-green-100 border-green-300",
    "bg-green-200 border-green-400",
    "bg-green-300 border-green-500",
    "bg-green-400 border-green-600",
  ];

  return (
    <div
      className={`group relative flex h-4 w-4 items-center justify-center rounded border ${clsx(colorEstado[estado])}`}
    >
      <div className="absolute bottom-5 text-nowrap hidden rounded-md bg-gray-800 px-2 py-1 text-xs text-white group-hover:flex z-10">
        Estado: {estado}
      </div>
    </div>
  );
}