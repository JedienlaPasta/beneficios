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
    <div className="grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
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
      <div className="md:col-span-2 2xl:col-span-1">
        <ActiveCapaign
          nombre="Pañales"
          termina="12 Sep, 2025"
          entregas={17}
          icono={<TbDiaper />}
        />
      </div>
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
    <div className="group relative flex min-w-64 flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300 transition-all hover:shadow-lg hover:shadow-slate-400/40">
      <div className="absolute left-[calc(100%-1rem)] top-0 h-60 w-[20rem] bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-8rem)] group-hover:-rotate-[-25deg]"></div>
      <div className="flex items-center justify-between px-7">
        <div>
          <div className="flex items-center justify-between gap-4 pt-6 text-slate-700">
            <span className="flex flex-col items-start">
              <h5 className="font-medium text-slate-600">{nombre}</h5>
              <p className="font text-xs text-slate-500">Termina: {termina}</p>
            </span>
          </div>
          <div className="flex items-center justify-start gap-2 pb-5 pt-1 text-slate-700">
            <p className="text-2xl font-bold">{entregas}</p>
            <FiBox className="text-2xl text-blue-500" />
          </div>
        </div>
        <span className="z-10 pr-4 text-3xl text-slate-600 transition-all duration-500 group-hover:text-[2.5rem] group-hover:text-white">
          {icono}
        </span>
      </div>
    </div>
  );
}
