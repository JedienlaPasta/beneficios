import { formatDate, formatNumber } from "@/app/lib/utils/format";
import DetailRow from "../campañas/[id]/detail-card";
import { redirect } from "next/navigation";
import { fetchRSHByRUT } from "@/app/lib/data/rsh";

type Props = {
  rut: string;
};

export default async function CitizenDetail({ rut }: Props) {
  const { data } = await fetchRSHByRUT(rut);
  if (data?.length === 0) {
    redirect("/dashboard/entregas");
  }
  const {
    nombres_rsh,
    apellidos_rsh,
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

  const formattedRut = formatNumber(rut) + (dv ? "-" + dv : "");
  const descripcion = nombres_rsh[0] + apellidos_rsh[0];

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
        <div className="flex flex-col items-start justify-between rounded-xl bg-white px-10 py-6 sm:flex-row sm:items-center">
          <div className="flex gap-4">
            <p className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-medium text-white shadow-sm">
              {descripcion}
            </p>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-800">
                  {nombres_rsh + " " + apellidos_rsh}
                </h1>
                <div className="hidden items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 sm:flex">
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

export function CitizenDetailSkeleton() {
  return (
    <div className="items-centers relative flex flex-col justify-center">
      <div className="grid gap-4 rounded-xl">
        {/* Header Section */}
        <div className="flex items-center justify-between rounded-xl bg-white px-10 py-6">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-gradient-to-br from-blue-200 to-blue-300 text-base font-medium text-white shadow-sm">
              ##
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="h-7 w-48 animate-pulse rounded-md bg-slate-200"></div>
                <div
                  className={`h-4 w-16 animate-pulse rounded-md bg-slate-200`}
                ></div>
              </div>
              <div className="mt-1 h-5 w-32 animate-pulse rounded-md bg-slate-200"></div>
            </div>
          </div>
          <div className="h-8 w-8 animate-pulse rounded-md bg-slate-200"></div>
        </div>

        {/* Details Grid */}
        <div className="mt-2 grid auto-rows-fr gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información General
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* ID */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Inicio */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Término */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
            </div>
          </div>
          {/* 2nd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información Contacto
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Telefono */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Direccion */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Correo */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
            </div>
          </div>
          {/* 3rd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información General
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Fecha Modificacion */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Fecha Calificacion */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="flex flex-col gap-1 text-sm font-medium text-slate-500">
                  {/* Ultima Entrega */}
                  {/* <div className="h-5 w-5 animate-pulse rounded-md bg-slate-200"></div> */}
                  <div className="h-5 w-24 animate-pulse rounded-md bg-slate-200"></div>
                  <div className="h-5 w-60 animate-pulse rounded-md bg-slate-200"></div>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
