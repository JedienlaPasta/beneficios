export default function NuevaCampañaForm() {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 bg-gray-300 p-3">
      <div className="col-span-2 flex justify-between">
        <h2>Crear Nueva Campaña</h2>
        <button className="h-8 w-8 rounded-md bg-white">+</button>
      </div>
      <div className="relative grow">
        <label
          htmlFor="nombre-campaña"
          className="absolute left-[0.5rem] top-0 text-[0.6rem] font-semibold text-slate-900/70"
        >
          NOMBRE
        </label>
        <div className="relative mt-4 flex h-9 grow overflow-hidden rounded-md border border-slate-900/15 bg-white px-4 pb-[2px]">
          <input
            id="nombre-campaña"
            type="text"
            placeholder="Buscar"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div className="relative">
        <label
          htmlFor="nombre-campaña"
          className="absolute left-[0.5rem] top-0 text-[0.6rem] font-semibold text-slate-900/70"
        >
          TÉRMINO
        </label>
        <div className="relative mt-4 flex h-9 overflow-hidden rounded-md border border-slate-900/15 bg-white px-4 pb-[2px]">
          <input
            id="nombre-campaña"
            type="text"
            placeholder="Buscar"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
      <div className="relative">
        <label
          htmlFor="nombre-campaña"
          className="absolute left-[0.5rem] top-0 text-[0.6rem] font-semibold text-slate-900/70"
        >
          DESCRIPCIÓN
        </label>
        <div className="relative mt-4 flex h-9 overflow-hidden rounded-md border border-slate-900/15 bg-white px-4 pb-[2px]">
          <input
            id="nombre-campaña"
            type="text"
            placeholder="Buscar"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </div>
    </div>
  );
}
