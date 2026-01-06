import { ActiveCampaignsForEntregas } from "@/app/lib/data/campanas";
import { FormValue } from "./NewModalForm";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { DynamicFieldsRenderer } from "./DynamicFieldsRenderer";
import { toast } from "sonner";

type CampaignsSelectionListProps = {
  selectedCampaigns: Record<
    string,
    { selected: boolean; answers: Record<string, FormValue> }
  >;
  activeCampaigns?: ActiveCampaignsForEntregas[];
  setSelectedCampaigns: React.Dispatch<
    React.SetStateAction<
      Record<string, { selected: boolean; answers: Record<string, FormValue> }>
    >
  >;
};

export default function CampaignsSelectionList({
  selectedCampaigns,
  activeCampaigns,
  setSelectedCampaigns,
}: CampaignsSelectionListProps) {
  const [isAnimating, setIsAnimating] = useState<Record<string, boolean>>({});

  const isOutOfStock = (campaign: ActiveCampaignsForEntregas) => {
    // Si stock es null, es "infinito" o "sin limite"
    if (campaign.stock === null) return false;
    const entregasRealizadas = campaign.total_entregas ?? 0;

    // Stock disponible
    const remaining = campaign.stock - entregasRealizadas;

    // Si queda menos de 1, está sin stock
    return remaining < 1;
  };

  const getStockLabel = (campaign: ActiveCampaignsForEntregas) => {
    if (campaign.stock === null) return "Sin límite";
    const remaining = campaign.stock - (campaign.total_entregas ?? 0);
    return Math.max(0, remaining); // Para que nunca muestre números negativos visualmente
  };

  // Handlers
  const handleCheckboxChange = (campaign: ActiveCampaignsForEntregas) => {
    const campaignId = campaign.id;

    if (isOutOfStock(campaign)) {
      toast.error(`La campaña '${campaign.nombre_campaña}' está sin stock.`);
      return;
    }

    setSelectedCampaigns((prev) => ({
      ...prev,
      [campaignId]: {
        ...prev[campaignId],
        selected: !prev[campaignId].selected,
      },
    }));
  };

  const handleFieldChange = (
    campaignId: string,
    fieldName: string,
    value: FormValue,
  ) => {
    setSelectedCampaigns((prev) => ({
      ...prev,
      [campaignId]: {
        ...prev[campaignId],
        answers: {
          ...prev[campaignId].answers,
          [fieldName]: value,
        },
      },
    }));
  };

  return (
    <div className="rounded-lg border-slate-200 xs:border xs:bg-slate-50 xs:p-4 sm:mt-2">
      <div className="mb-3 flex items-baseline justify-between border-b border-slate-200 pb-2 xs:bg-slate-50">
        <h3 className="text-sm font-medium text-slate-700">
          Beneficios seleccionados
        </h3>
        <div className="hidden rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 xs:block">
          {Object.values(selectedCampaigns).filter((v) => v.selected).length}{" "}
          seleccionadas
        </div>
      </div>

      <div className="space-y-3">
        {activeCampaigns?.map((campaign) => {
          const isSelected = !!selectedCampaigns[campaign.id]?.selected;
          const outOfStock = isOutOfStock(campaign);

          const fieldsCount = JSON.parse(
            campaign.esquema_formulario || "[]",
          ).length;

          const dynamicDuration = Math.min(0.2 + fieldsCount * 0.1, 1.0);

          return (
            <div
              key={campaign.id}
              className={`overflow-hiddens rounded-lg border bg-white shadow-sm transition-all hover:border-slate-300 ${
                isSelected
                  ? "!border-blue-300 ring-2 ring-blue-200"
                  : outOfStock
                    ? "!border-rose-300"
                    : "!border-slate-200"
              }`}
            >
              <div
                className="flex cursor-pointer items-start gap-3 p-3"
                onClick={() => handleCheckboxChange(campaign)}
              >
                {/* Checkbox Visual */}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    isSelected
                      ? "border-blue-500 bg-blue-500"
                      : outOfStock
                        ? "!border-rose-300"
                        : "!border-slate-200"
                  }`}
                >
                  {isSelected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      className={`cursor-pointer text-sm font-medium ${outOfStock ? "text-rose-400" : "text-slate-700"}`}
                    >
                      {campaign.nombre_campaña}
                    </label>
                    <span
                      className={`hidden rounded-full border px-2 py-0.5 text-xs xs:inline-block ${outOfStock ? "border-rose-300 bg-rose-50 text-rose-500" : "border-gray-200 bg-gray-50 text-gray-600"}`}
                    >
                      Stock: {getStockLabel(campaign)}
                    </span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{ height: 0, opacity: 0, overflow: "hidden" }}
                    transition={{
                      duration: dynamicDuration,
                      ease: "easeInOut",
                    }}
                    onAnimationStart={() =>
                      setIsAnimating((prev) => ({
                        ...prev,
                        [campaign.id]: true,
                      }))
                    }
                    onAnimationComplete={() =>
                      setIsAnimating((prev) => ({
                        ...prev,
                        [campaign.id]: false,
                      }))
                    }
                    // Estilo dinámico según el estado
                    style={{
                      overflow:
                        isSelected && !isAnimating[campaign.id]
                          ? "visible"
                          : "hidden",
                    }}
                  >
                    <div className="rounded-b-lg border-t border-slate-100 bg-slate-50 p-3">
                      <DynamicFieldsRenderer
                        schemaString={campaign.esquema_formulario || "[]"}
                        values={selectedCampaigns[campaign.id]?.answers}
                        onChange={(fieldName, val) =>
                          handleFieldChange(campaign.id, fieldName, val)
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {(!activeCampaigns || activeCampaigns.length === 0) && (
          <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No hay campañas activas disponibles
          </div>
        )}
      </div>
    </div>
  );
}
