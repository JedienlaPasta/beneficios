import NuevaCampañaForm from "@/app/ui/dashboard/campañas/nueva_campaña_form";
import { roboto } from "@/app/ui/fonts";

export default function Campanas() {
  const tableData = [
    {
      nombre: "Materiales de Construcción",
      entregas: 32,
      estado: "En curso",
      fecha: "21 / 05 / 2025",
    },
    {
      nombre: "Balones de Gas",
      entregas: 32,
      estado: "En curso",
      fecha: "12 / 02 / 2024",
    },
    {
      nombre: "Pack de Pañales",
      entregas: 32,
      estado: "Terminado",
      fecha: "27 / 08 / 2021",
    },
    {
      nombre: "Desratización",
      entregas: 32,
      estado: "Terminado",
      fecha: "04 / 09 / 2020",
    },
    {
      nombre: "Tarjeta de Comida",
      entregas: 32,
      estado: "Terminado",
      fecha: "09 / 12 / 2019",
    },
  ];
  const tableRows = tableData.map((item, index) => (
    <TableRow key={index} item={item} />
  ));

  return (
    <div className="overflow-hidden p-4 text-slate-900">
      <h2 className="bg-slate-100">Campañas</h2>
      {/* Form para ingresar nueva campaña */}
      <NuevaCampañaForm />
      {/* Campañas Activas */}
      <div className="mt-4 flex bg-gray-300">
        <div>
          <h2 className="text-sm font-semibold text-slate-900/80">
            Campañas Activas
          </h2>
          <div className="flex flex-col gap-5 overflow-x-auto p-4">
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

        {/* tabla campañas */}
        <div className="flex flex-col gap-4">
          <h2>Histórico Campañas</h2>
          <div>
            <div className="flex h-9 max-w-80 overflow-hidden rounded-md border border-slate-900/15 bg-white px-8 pb-[2px]">
              <input
                type="text"
                placeholder="Buscar"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-900/10">
            <table className="flex min-w-[44rem] flex-col overflow-hidden bg-white px-6 py-2 text-slate-900/90">
              <thead>
                <tr className="grid-cols-18 grid gap-4 text-left text-sm">
                  <th className="col-span-8 px-3 py-2 font-medium">Campaña</th>
                  <th className="col-span-4 px-3 py-2 font-medium">Entrega</th>
                  <th className="col-span-3 px-3 py-2 font-medium">Estado</th>
                  <th className="col-span-3 px-3 py-2 text-right font-medium">
                    Entregas
                  </th>
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
    <div className="w-60 shrink-0 overflow-hidden rounded-xl border border-slate-900/15 bg-white text-slate-900/80">
      <h5 className="border-b border-slate-900/15 px-7 pb-2 pt-3 text-sm font-medium">
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

// Tabla
function TableRow({
  item,
}: {
  item: { nombre: string; entregas: number; estado: string; fecha: string };
}) {
  const { nombre, entregas, estado, fecha } = item;

  return (
    <tr className="grid-cols-18 grid gap-4 text-sm">
      <CustomRow col_span="col-span-8">{nombre}</CustomRow>
      <CustomRow col_span="col-span-4" font={roboto.className}>
        {fecha}
      </CustomRow>
      <CustomRow col_span="col-span-3">{estado}</CustomRow>
      <CustomRow col_span="col-span-3" font={roboto.className}>
        {entregas}
      </CustomRow>
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
  const rowStyle = col_span + " px-3 py-1 text-sm " + numberFont;

  return <td className={rowStyle}>{children}</td>;
}
