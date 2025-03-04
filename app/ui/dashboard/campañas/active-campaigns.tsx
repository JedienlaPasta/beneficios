import { JSX } from "react";
import { FiBox } from "react-icons/fi";
import { IoCardOutline, IoTicketOutline } from "react-icons/io5";
import { TbDiaper } from "react-icons/tb";

type ActiveCampaignsProps = {
  nombre: string;
  termina: string;
  entregas: number;
  icono: JSX.Element;
};

export default function ActiveCampaigns() {
  return (
    <div className="flex flex-wrap gap-4">
      <ActiveCapaign
        nombre="Vale de Gas"
        termina="27 Abr, 2025"
        entregas={126}
        icono={<IoTicketOutline />}
      />
      <ActiveCapaign
        nombre="Tarjeta de Comida"
        termina="04 Jun, 2025"
        entregas={83}
        icono={<IoCardOutline />}
      />
      <ActiveCapaign
        nombre="Pañales"
        termina="12 Sep, 2025"
        entregas={17}
        icono={<TbDiaper />}
      />
    </div>
  );
}

function ActiveCapaign({
  nombre,
  termina,
  entregas,
  icono,
}: ActiveCampaignsProps) {
  return (
    <div className="flex min-w-64 grow flex-col rounded-xl bg-white shadow-md shadow-slate-300">
      <div className="flex items-center justify-between px-7">
        <div>
          <div className="flex items-center justify-between gap-4 pt-6 text-slate-700">
            <span className="flex flex-col items-start">
              <h5 className="font-medium">{nombre}</h5>
              <p className="font text-xs text-slate-500">Termina: {termina}</p>
            </span>
          </div>
          <div className="flex items-center justify-start gap-2 pb-5 pt-2 text-slate-700">
            <p className="text-4xl font-bold">{entregas}</p>
            <FiBox className="text-2xl text-blue-500" />
          </div>
        </div>
        <span className="pr-3 text-4xl text-slate-600">{icono}</span>
      </div>
    </div>
  );
}
