import { JSX } from "react";
import { FiBox } from "react-icons/fi";
import { IoCardOutline, IoTicketOutline } from "react-icons/io5";
import { TbDiaper } from "react-icons/tb";

type CampañasActivasProps = {
  nombre: string;
  termina: string;
  entregas: number;
  icono: JSX.Element;
};

export default function CampañasActivas() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <CampañaActiva
          nombre="Vale de Gas"
          termina="27 Abr, 2025"
          entregas={126}
          icono={<IoTicketOutline className="text-4xl" />}
        />
        <CampañaActiva
          nombre="Tarjeta de Comida"
          termina="04 Jun, 2025"
          entregas={83}
          icono={<IoCardOutline className="text-4xl" />}
        />
        <CampañaActiva
          nombre="Pañales"
          termina="12 Sep, 2025"
          entregas={17}
          icono={<TbDiaper className="text-4xl" />}
        />
      </div>
    </div>
  );
}

function CampañaActiva({
  nombre,
  termina,
  entregas,
  icono,
}: CampañasActivasProps) {
  return (
    <div className="relative flex w-96 flex-col rounded-xl bg-white shadow-md shadow-slate-300">
      <div className="flex items-center gap-4 px-7 pt-6 text-slate-700">
        <span className="text-slate-600">{icono}</span>
        <span className="flex flex-col items-start">
          <h5 className="font-medium">{nombre}</h5>
          <p className="font text-xs text-slate-500">Termina: {termina}</p>
        </span>
      </div>
      <div className="absolute bottom-6 left-7 flex items-center gap-2">
        <div className="h-3 w-3 rounded-lg bg-green-500"></div>
        <p className="text-xs text-green-600">En curso</p>
      </div>
      <div className="flex items-center justify-end gap-2 px-7 pb-5 pt-2 text-slate-700">
        <FiBox className="text-2xl text-blue-500" />
        <p className="text-xl font-bold">{entregas}</p>
      </div>
    </div>
  );

  return (
    <div className="relative flex w-96 flex-col rounded-xl bg-slate-900/90 shadow-md shadow-slate-600/90">
      <div className="flex items-center gap-4 px-7 pt-5 text-slate-200">
        <span className="text-slate-200">{icono}</span>
        <span className="flex flex-col items-start">
          <h5 className="font-medium">{nombre}</h5>
          <p className="font text-xs text-slate-400">Termina: {termina}</p>
        </span>
      </div>
      <div className="absolute bottom-3 left-7 flex items-center gap-2">
        <div className="h-3 w-3 rounded-lg bg-green-400"></div>
        <p className="text-xs text-green-300">En curso</p>
      </div>
      <div className="flex items-center justify-end gap-2 px-7 pb-3 pt-2 text-white">
        <FiBox className="text-xl text-blue-400" />
        <p className="text-sm">126</p>
      </div>
    </div>
  );
}
