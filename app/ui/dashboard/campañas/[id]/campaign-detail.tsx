import { Campaign } from "@/app/lib/definitions";
import { formatDate } from "@/app/lib/utils";
import CampaignOptionsMenu from "./options-menu";
import DetailRow from "./detail-card";
import StaticRequirementsCard from "./static-card-requirements";
import SocialAidsGivenResume from "./social-aids-given-resume";
import { fetchCampaignById } from "@/app/lib/data/campañas";

export default async function CampaignDetail({ id }: { id: string }) {
  const { data } = (await fetchCampaignById(id)) as { data: Campaign[] }; // Que tal si mejor hago el redirect normal, en el form y que aca de alguna forma no se haga el fetch
  if (data.length === 0) {
    // redirect("/dashboard/campanas");
    return null;
  }
  const {
    nombre,
    fecha_inicio,
    fecha_termino,
    descripcion,
    estado,
    entregas,
    tipo_dato,
    tramo,
    discapacidad,
    adulto_mayor,
  } = data[0];
  const inicio = formatDate(fecha_inicio);
  const termino = formatDate(fecha_termino);

  return (
    <div className="items-centers relative flex flex-col justify-center">
      <div className="grid gap-4 rounded-xl border border-gray-200">
        {/* Header Section */}
        <div className="flex items-center justify-between rounded-xl bg-white px-10 py-6">
          <div className="flex gap-4">
            <p className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-medium text-white shadow-sm">
              {descripcion}
            </p>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-800">
                  {nombre}
                </h1>
                <div className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5">
                  <span className="h-2 w-2 rounded-xl bg-green-500"></span>
                  <p className="text-xs font-medium text-green-500">{estado}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500">{tipo_dato}</p>
            </div>
          </div>
          <CampaignOptionsMenu id={id} />
        </div>

        {/* Details Grid */}
        <div className="mt-2 grid auto-rows-fr gap-6 xl:grid-cols-2 2xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información General
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <DetailRow name="ID" value={id} border={true} />
              <DetailRow name="Inicio" value={inicio} border={true} />
              <DetailRow name="Término" value={termino} />
            </div>
          </div>
          {/* 2nd segmant */}
          <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Criterios de Entrega
            </h2>
            <div className="flex flex-col gap-2 rounded-xl px-6">
              <StaticRequirementsCard
                isRequired={Boolean(tramo)}
                description="Hasta 40%"
              >
                Tramo
              </StaticRequirementsCard>
              <StaticRequirementsCard
                isRequired={Boolean(discapacidad)}
                description="Discapacidad o Dependencia"
              >
                Discapacidad
              </StaticRequirementsCard>
              <StaticRequirementsCard
                isRequired={Boolean(adulto_mayor)}
                description="60 Años o Más"
              >
                Adulto Mayor
              </StaticRequirementsCard>
            </div>
          </div>
          {/* 3rd segment */}
          <div className="rounded-xl border border-slate-200 bg-gray-100 xl:col-span-2 2xl:col-span-1">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Entregado
            </h2>
            <div className="flex flex-col gap-2 rounded-xl px-6">
              <SocialAidsGivenResume entregas={entregas} period="Esta Semana" />
              <SocialAidsGivenResume entregas={entregas} period="Este Mes" />
              <SocialAidsGivenResume entregas={entregas} period="Totales" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
