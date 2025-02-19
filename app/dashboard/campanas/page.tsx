import CampañasActivas from "@/app/ui/dashboard/campañas/campañas_activas";
// import NuevaCampañaForm from "@/app/ui/dashboard/campañas/nueva_campaña_form";
import { inter, roboto, roboto_mono } from "@/app/ui/fonts";

export default function Campanas() {
  const tableData = [
    {
      nombre: "Materiales de Construcción",
      entregas: 76,
      estado: "En curso",
      inicio: "21 / 05 / 2025",
      termino: "21 / 05 / 2025",
    },
    {
      nombre: "Balones de Gas",
      entregas: 241,
      estado: "En curso",
      inicio: "12 / 02 / 2024",
      termino: "12 / 02 / 2024",
    },
    {
      nombre: "Pack de Pañales",
      entregas: 12,
      estado: "Terminado",
      inicio: "27 / 08 / 2021",
      termino: "27 / 08 / 2021",
    },
    {
      nombre: "Desratización",
      entregas: 3,
      estado: "Terminado",
      inicio: "04 / 09 / 2020",
      termino: "04 / 09 / 2020",
    },
    {
      nombre: "Tarjeta de Comida",
      entregas: 127,
      estado: "Terminado",
      inicio: "09 / 12 / 2019",
      termino: "09 / 12 / 2019",
    },
    {
      nombre: "Materiales de Construcción",
      entregas: 76,
      estado: "En curso",
      inicio: "21 / 05 / 2025",
      termino: "21 / 05 / 2025",
    },
    {
      nombre: "Balones de Gas",
      entregas: 241,
      estado: "En curso",
      inicio: "12 / 02 / 2024",
      termino: "12 / 02 / 2024",
    },
    {
      nombre: "Pack de Pañales",
      entregas: 12,
      estado: "Terminado",
      inicio: "27 / 08 / 2021",
      termino: "27 / 08 / 2021",
    },
    {
      nombre: "Desratización",
      entregas: 3,
      estado: "Terminado",
      inicio: "04 / 09 / 2020",
      termino: "04 / 09 / 2020",
    },
    {
      nombre: "Tarjeta de Comida",
      entregas: 127,
      estado: "Terminado",
      inicio: "09 / 12 / 2019",
      termino: "09 / 12 / 2019",
    },
    {
      nombre: "Materiales de Construcción",
      entregas: 76,
      estado: "En curso",
      inicio: "21 / 05 / 2025",
      termino: "21 / 05 / 2025",
    },
    {
      nombre: "Balones de Gas",
      entregas: 241,
      estado: "En curso",
      inicio: "12 / 02 / 2024",
      termino: "12 / 02 / 2024",
    },
    {
      nombre: "Pack de Pañales",
      entregas: 12,
      estado: "Terminado",
      inicio: "27 / 08 / 2021",
      termino: "27 / 08 / 2021",
    },
    {
      nombre: "Desratización",
      entregas: 3,
      estado: "Terminado",
      inicio: "04 / 09 / 2020",
      termino: "04 / 09 / 2020",
    },
    {
      nombre: "Tarjeta de Comida",
      entregas: 127,
      estado: "Terminado",
      inicio: "09 / 12 / 2019",
      termino: "09 / 12 / 2019",
    },
  ];
  const tableRows = tableData.map((item, index) => (
    <TableRow key={index} item={item} />
  ));

  return (
    <div className="w-full overflow-hidden p-4 text-slate-900">
      <div className="flex items-center justify-between px-6">
        <h2 className="text-2xl font-bold">Campañas</h2>
        <button className="h-10 rounded-md bg-slate-800 px-6 text-sm text-white">
          Nueva Campaña
        </button>
      </div>
      {/* Form para ingresar nueva campaña */}
      {/* <NuevaCampañaForm /> */}
      <div className="mt-4 flex flex-col gap-8 rounded-xl p-6">
        {/* Campañas Activas */}
        <CampañasActivas />
        {/* tabla campañas */}
        <div className="flex flex-col gap-4">
          <h2 className={`text-lg font-bold text-slate-900/90`}>
            Historial de Campañas Creadas
          </h2>
          <div>
            <div className="flex h-9 max-w-80 overflow-hidden rounded-md border border-gray-900/15 bg-white px-8 pb-[2px]">
              <input
                type="text"
                placeholder="Buscar"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto rounded-md border border-gray-900/15">
            <table className="flex min-w-[44rem] grow flex-col overflow-hidden bg-white text-slate-900/90">
              <thead className="bg-slate-800 py-1 text-xs font-semibold text-white">
                <tr className="grid-cols-24 grid text-left">
                  <th className="col-span-9 px-6 py-3">CAMPAÑA</th>
                  <th className="col-span-4 px-6 py-3">INICIO</th>
                  <th className="col-span-4 px-6 py-3">TÉRMINO</th>
                  <th className="col-span-4 px-6 py-3">ESTADO</th>
                  <th className="col-span-3 px-6 py-3 text-right">ENTREGAS</th>
                </tr>
              </thead>
              <tbody>{tableRows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Tabla
function TableRow({
  item,
}: {
  item: {
    nombre: string;
    entregas: number;
    estado: string;
    inicio: string;
    termino: string;
  };
}) {
  const { nombre, entregas, estado, inicio, termino } = item;

  return (
    <tr className="grid-cols-24 grid text-sm odd:bg-gray-800/10 hover:bg-gray-800/20">
      <CustomRow col_span="col-span-9">{nombre}</CustomRow>
      <CustomRow col_span="col-span-4">{inicio}</CustomRow>
      <CustomRow col_span="col-span-4">{termino}</CustomRow>
      <CustomRow col_span="col-span-4">{estado}</CustomRow>
      <CustomRow col_span="col-span-3">{entregas}</CustomRow>
    </tr>
  );
}

function CustomRow({
  children,
  col_span,
  font,
}: {
  children: string | number;
  col_span: string;
  font?: string;
}) {
  const numberFont = typeof children === "string" ? font : font + " text-right";
  const rowStyle = col_span + " px-6 py-3 text-sm tabular-nums " + numberFont;

  return <td className={rowStyle}>{children}</td>;
}
