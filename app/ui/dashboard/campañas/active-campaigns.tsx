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
    <div className="grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
      <div className="md:col-span-2 lg:col-span-1">
        <ActiveCapaign
          nombre="Vale de Gas"
          termina="27 Abr, 2025"
          entregas={126}
          icono={<IoTicketOutline />}
        />
      </div>
      <div className="md:col-span-2 lg:col-span-1">
        <ActiveCapaign
          nombre="Tarjeta de Comida"
          termina="04 Jun, 2025"
          entregas={83}
          icono={<IoCardOutline />}
        />
      </div>
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
    <div className="group relative flex min-w-64 flex-1 cursor-pointer flex-col overflow-hidden rounded-xl bg-white shadow-md shadow-slate-300 transition-all duration-300 hover:shadow-lg hover:shadow-slate-400/40">
      {/* Decorative gradient element */}
      <div className="absolute left-[calc(100%-1rem)] top-0 h-60 w-[20rem] bg-gradient-to-b from-blue-500 to-blue-700 transition-all duration-500 group-hover:left-[calc(100%-8rem)] group-hover:-rotate-[-25deg]"></div>

      {/* Card content */}
      <div className="flex items-center justify-between px-7 py-5">
        <div>
          <div className="flex items-center gap-4 pt-1 text-slate-700">
            <span className="flex flex-col items-start">
              <h5 className="text-lg font-semibold text-slate-700">{nombre}</h5>
              <p className="mt-1 flex items-center text-xs text-slate-500">
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Termina: {termina}
              </p>
            </span>
          </div>
          <div className="mt-4 flex items-center justify-start gap-2 text-slate-700">
            <p className="text-3xl font-bold text-blue-600">{entregas}</p>
            <FiBox className="text-2xl text-blue-500" />
          </div>
        </div>
        <div className="z-10 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl text-blue-500 transition-all duration-500 group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-md">
          {icono}
        </div>
      </div>
    </div>
  );
}
