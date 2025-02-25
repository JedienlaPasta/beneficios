import { JSX } from "react";

type CampañasActivasProps = {
  nombre: string;
  termina: string;
  icono: JSX.Element;
};

export default function CampañasActivas({
  nombre,
  termina,
  icono,
}: CampañasActivasProps) {
  const estiloBase =
    "overflow-hidden rounded-xl w-80 shrink-0 bg-slate-900/90 shadow-md shadow-slate-600/90";
  const estiloPersonalizado = estiloBase;

  return (
    <div className={estiloPersonalizado}>
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
