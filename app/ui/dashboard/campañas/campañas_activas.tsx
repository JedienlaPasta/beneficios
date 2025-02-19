export default function CampañasActivas() {
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-slate-900/90">Campañas Activas</h2>
      <div className="flex gap-5 overflow-x-auto">
        <CampañaActiva
          nombre={"Balón de Gas"}
          fecha={"12/02/2025"}
          entregado={70}
        />
        <CampañaActiva
          nombre={"Balón de Gas"}
          fecha={"12/02/2025"}
          entregado={70}
        />
        <CampañaActiva
          nombre={"Balón de Gas"}
          fecha={"12/02/2025"}
          entregado={70}
        />
      </div>
    </div>
  );
}

// Campaña
function CampañaActiva({
  nombre,
  fecha,
  entregado,
}: {
  nombre: string;
  fecha: string;
  entregado: number;
}) {
  return (
    <div className="w-60 shrink-0 overflow-hidden rounded-xl border border-slate-900/15 bg-slate-800 text-white">
      <h5 className="bg-slate-900 px-7 pb-2 pt-3 text-sm font-medium">
        {nombre}
      </h5>
      <div className="bg-red grid grid-cols-2 gap-7 px-7 pb-3 pt-2 text-sm">
        <span>
          <label className="text-xs">Término</label>
          <p className="text-xs">{fecha}</p>
        </span>
        <span>
          <label className="text-xs">Entregas</label>
          <p className="text-xs">{entregado}</p>
        </span>
      </div>
    </div>
  );
}
