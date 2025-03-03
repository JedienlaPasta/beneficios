import { JSX } from "react";
import { IoCardOutline, IoTicketOutline } from "react-icons/io5";
import { TbDiaper } from "react-icons/tb";

type CampañasActivasProps = {
  nombre: string;
  termina: string;
  icono: JSX.Element;
};

export default function CampañasActivas() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 px-10 pb-8 pt-4">
      <h2 className="text-lg font-semibold text-slate-800">Campañas Activas</h2>
      <div className="flex gap-4">
        <CampañaActiva
          nombre="Vale de Gas"
          termina="27 Abr, 2025"
          icono={<IoTicketOutline className="text-4xl" />}
        />
        <CampañaActiva
          nombre="Tarjeta de Comida"
          termina="04 Jun, 2025"
          icono={<IoCardOutline className="text-4xl" />}
        />
        <CampañaActiva
          nombre="Pañales"
          termina="12 Sep, 2025"
          icono={<TbDiaper className="text-4xl" />}
        />
      </div>
    </div>
  );
}

function CampañaActiva({ nombre, termina, icono }: CampañasActivasProps) {
  return (
    <div className="w-80 rounded-xl bg-slate-900/90 shadow-md shadow-slate-600/90">
      <div className="relative flex items-center gap-4 px-7 py-5 text-white">
        <div className="absolute bottom-5 right-5 h-3 w-3 rounded-lg bg-green-400"></div>
        {icono}
        <span className="flex flex-col items-start">
          <h5 className="font-medium">{nombre}</h5>
          <p className="font text-xs text-slate-400">Termina: {termina}</p>
        </span>
      </div>
    </div>
  );
}
