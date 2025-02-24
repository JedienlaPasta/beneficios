type CampañasActivasProps = {
  nombre: string;
  termina: string;
};

export default function CampañasActivas({
  nombre,
  termina,
}: CampañasActivasProps) {
  const estiloBase =
    "overflow-hidden rounded-xl w-80 shrink-0 text-white bg-slate-900/90 shadow-mds shadow-md shadow-slate-600/90 flex flex-col gap-1";
  const estiloPersonalizado = estiloBase;

  return (
    <div className={estiloPersonalizado}>
      <h5 className="text px-7 pb-1 pt-4 font-medium">{nombre}</h5>
      <span className="flex items-center justify-between px-7 pb-3">
        <p className="text-xs text-orange-400">Término</p>
        <p className="self-end text-2xl font-bold text-orange-400">{termina}</p>
      </span>
    </div>
  );
}
