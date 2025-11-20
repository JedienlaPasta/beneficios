import { formatDate } from "@/app/lib/utils/format";
import CampaignOptionsMenu from "./options-menu";
// import DetailRow from "./detail-card"; // POR ELIMINAR SI NO LO UTILIZO
import StaticRequirementsCard from "./static-card-requirements";
import { fetchCampaignById } from "@/app/lib/data/campañas";
import { redirect } from "next/navigation";
import RoleGuard from "@/app/ui/auth/role-guard";
// import EntregasStockSummary from "./entregas-stock-summary"; // POR ELIMINAR SI NO LO UTILIZO

export default async function CampaignDetail({ id }: { id: string }) {
  const {
    nombre_campaña,
    fecha_inicio,
    fecha_termino,
    code,
    stock,
    entregas,
    tipo_dato,
    tramo,
    discapacidad,
    adulto_mayor,
  } = await fetchCampaignById(id);
  if (nombre_campaña === "") {
    redirect("/dashboard/campanas");
  }
  const inicio = formatDate(fecha_inicio);
  const termino = formatDate(fecha_termino);
  const estado = fecha_termino
    ? fecha_termino > new Date()
      ? "En curso"
      : "Finalizado"
    : "";

  const colorEstado =
    estado === "En curso"
      ? {
          bg: "bg-emerald-50",
          dot_bg: "bg-emerald-600",
          text_color: "text-emerald-600",
          border_color: "border-emerald-200",
        }
      : {
          bg: "bg-slate-100",
          dot_bg: "bg-slate-500",
          text_color: "text-slate-500",
          border_color: "border-slate-200",
        };

  const isUnlimited = stock === null;
  const totalStockValue = stock ?? null;
  const deliveredCount = entregas || 0;
  const availableValue = isUnlimited
    ? null
    : Math.max((totalStockValue || 0) - deliveredCount, 0);

  const clampPercent = (value: number) =>
    Math.max(0, Math.min(100, Math.round(value)));

  const progressPct: number | null = isUnlimited
    ? null
    : totalStockValue && totalStockValue > 0
      ? clampPercent((deliveredCount / totalStockValue) * 100)
      : 0;

  return (
    <div className="items-centers relative flex flex-col justify-center">
      <div className="grid gap-4 rounded-xl">
        {/* Header Section */}
        <div className="flex flex-col rounded-xl bg-white px-6 pb-3 pt-7 shadow-sm md:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <p className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-medium text-white shadow-sm">
                {code}
              </p>
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-700">
                    {nombre_campaña}
                  </h1>
                  <div
                    className={`inline-flex items-center gap-1 rounded-md border ${colorEstado.border_color} ${colorEstado.bg} px-2 py-0.5 text-xs font-medium ${colorEstado.text_color}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-xl ${colorEstado.dot_bg}`}
                    />
                    <span
                      className={`text-xs font-medium ${colorEstado.text_color}`}
                    >
                      {estado}
                    </span>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {tipo_dato}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                    Inicio: {inicio}
                  </span>
                  <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                    Término: {termino}
                  </span>
                </div>
              </div>
            </div>
            <RoleGuard allowedRoles={["Administrador", "Supervisor"]}>
              <CampaignOptionsMenu id={id} />
            </RoleGuard>
          </div>

          <div className="mt-4 grid items-baseline border-t border-gray-100 py-3">
            <span className="flex items-baseline gap-1 text-sm font-medium text-slate-700">
              <span className="font-medium text-slate-700">{"Id:"}</span>
              <span className="text-sm text-blue-500">{id}</span>
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-2 grid auto-rows-fr gap-6 xl:grid-cols-2 2xl:grid-cols-2">
          {/* <div className="rounded-xl border border-slate-200 bg-gray-100">
            <h2 className="px-10 py-4 text-sm font-medium text-slate-400">
              Información General
            </h2>
            <div className="rounded-xl bg-white px-10 py-2">
              <DetailRow name="ID" value={id} border={true} />
              <DetailRow name="Inicio" value={inicio} border={true} />
              <DetailRow name="Término" value={termino} />
            </div>
          </div> */}
          {/* 2nd segmant */}
          <div className="order-2 rounded-xl border border-slate-200 bg-white">
            <h2 className="px-10 pb-4 pt-5 text-sm font-medium text-slate-500">
              Criterios de Entrega
            </h2>
            <div className="flex flex-col gap-2 rounded-xl px-6 pb-6">
              <StaticRequirementsCard
                isRequired={Boolean(tramo)}
                description="Hasta 40%"
              >
                Tramo
              </StaticRequirementsCard>
              <StaticRequirementsCard
                isRequired={Boolean(discapacidad)}
                description="Menor de 12 años"
              >
                Niño
              </StaticRequirementsCard>
              <StaticRequirementsCard
                isRequired={Boolean(adulto_mayor)}
                description="60 años o más"
              >
                Adulto Mayor
              </StaticRequirementsCard>
            </div>
          </div>
          {/* 3rd segment */}
          <div className="rounded-xl border border-slate-200 bg-white xl:col-span-2 2xl:col-span-1">
            <h2 className="px-10 pb-4 pt-5 text-sm font-medium text-slate-500">
              Resumen Stock
            </h2>
            <div className="flex flex-col gap-3 rounded-xl px-6">
              {/* Tarjetas compactas */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex flex-col items-start justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 sm:px-5">
                  <div className="text-xs tracking-wide text-slate-400">
                    Total
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {isUnlimited ? (
                      <span className="text-blue-600">Ilimitado</span>
                    ) : (
                      totalStockValue?.toLocaleString()
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 sm:px-5">
                  <div className="text-xs tracking-wide text-slate-400">
                    Disponible
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {isUnlimited ? (
                      <span className="text-blue-600">Ilimitado</span>
                    ) : (
                      (availableValue || 0).toLocaleString()
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start justify-between rounded-xl border border-slate-100 bg-white px-4 py-3 sm:px-5">
                  <div className="text-xs tracking-wide text-slate-400">
                    Entregado
                  </div>
                  <div className="text-sm font-semibold text-slate-700">
                    {deliveredCount.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progreso de entrega */}
              <div className="rounded-xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Progreso de entrega</span>
                  <span>
                    {progressPct !== null ? `${progressPct}%` : "Ilimitado"}
                  </span>
                </div>
                {progressPct !== null ? (
                  <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">
                    Sin límite de stock. Las entregas no afectan disponibilidad.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
