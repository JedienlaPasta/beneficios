import { formatDate, formatNumber } from "@/app/lib/utils";
// import CampaignOptionsMenu from "../campañas/[id]/options-menu";
import DetailRow from "../campañas/[id]/detail-card";
import { RSH } from "@/app/lib/definitions";

export default async function CitizenDetail({ data }: { data: RSH[] }) {
  const {
    nombres,
    apellidos,
    rut,
    direccion,
    // sector,
    tramo,
    telefono,
    dv,
    fecha_nacimiento,
    genero,
    correo,
    // indigena,
    fecha_calificacion,
    folio,
    // fecha_encuesta,
    nacionalidad,
    fecha_modificacion,
    ultima_entrega,
  } = data[0];

  console.log(data[0]);

  const formattedRut = formatNumber(rut) + (dv ? "-" + dv : "");
  const descripcion = nombres[0] + apellidos[0];

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(fecha_nacimiento.toString());

  return (
    <div className="items-centers relative flex flex-col justify-center">
      <div className="grid gap-4 rounded-xl">
        {/* Header Section */}
        <div className="flex items-center justify-between rounded-xl bg-white px-10 py-6">
          <div className="flex gap-4">
            <p className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-medium text-white shadow-sm">
              {descripcion}
            </p>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-800">
                  {nombres + " " + apellidos}
                </h1>
                <div className="flex items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5">
                  <p className="text-xs font-medium text-slate-500">
                    {"F#" + folio}
                  </p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">
                {formattedRut}
              </p>
            </div>
          </div>
          {/* <CampaignOptionsMenu id={id} /> */}
          <span className="flex flex-col text-slate-500">
            <p className="text-xs uppercase tracking-wider">Tramo</p>
            <p className="text-2xl font-bold text-slate-600">{tramo}%</p>
          </span>
        </div>

        {/* Details Grid */}
        <div className="mt-2 grid auto-rows-fr gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información General
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              {/* <DetailRow name="ID" value={id} border={true} /> */}
              <DetailRow
                name="Nacionalidad"
                value={nacionalidad}
                border={true}
              />
              <DetailRow name="Género" value={genero} border={true} />
              <DetailRow name="Edad" value={age.toString()} />
            </div>
          </div>
          {/* 2nd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información Contacto
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <DetailRow
                name="Teléfono"
                value={telefono?.toString() || "Sin teléfono"}
                border={true}
              />
              <DetailRow
                name="Dirección"
                value={direccion?.toString() || "Sin dirección"}
                border={true}
              />
              <DetailRow name="Correo" value={correo || "Sin correo"} />
            </div>
          </div>
          {/* 3rd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100 xl:col-span-2 2xl:col-span-1">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Fechas
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <DetailRow
                name="Fecha Modificación"
                value={formatDate(fecha_modificacion) || "Sin teléfono"}
                border={true}
              />
              <DetailRow
                name="Fecha Calificación"
                value={formatDate(fecha_calificacion) || "Sin dirección"}
                border={true}
              />
              <DetailRow
                name="Última Entrega"
                value={formatDate(ultima_entrega) || "Sin entregas"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
