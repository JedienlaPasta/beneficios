"use client";
import { toast } from "sonner";
import { SubmitButton } from "../../submit-button";
import { useState } from "react";
import { Campaign } from "@/app/lib/definitions";
import { createEntrega } from "@/app/lib/actions/entregas";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicFieldsRenderer } from "./DynamicFieldsRenderer";

export type FormValue = string | number | boolean | null | undefined;

export type DynamicFieldSchema = {
  nombre: string;
  label: string;
  tipo: "text" | "number" | "select" | "boolean";
  opciones?: string[];
  requerido: boolean;
};

export type NewModalFormProps = {
  activeCampaigns?: Campaign[];
  rut: string;
  userId?: string;
};

export default function NewModalForm({
  activeCampaigns,
  rut,
  userId,
}: NewModalFormProps) {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState("");

  const [selectedCampaigns, setSelectedCampaigns] = useState<{
    [campaignId: string]: {
      selected: boolean;
      answers: Record<string, FormValue>;
    };
  }>(() => {
    if (activeCampaigns && activeCampaigns.length > 0) {
      return activeCampaigns.reduce(
        (acc, campaign) => {
          acc[campaign.id] = {
            selected: false,
            answers: {},
          };
          return acc;
        },
        {} as {
          [key: string]: {
            selected: boolean;
            answers: Record<string, FormValue>;
          };
        },
      );
    }
    return {};
  });

  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("newsocialaid", "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // const createEntregaWithId = createEntrega.bind(null, userId);

  const checkValues = (campaign: Campaign) => {
    if (campaign.stock === null) return;
    if (campaign.entregas === null) return;
    if (campaign.stock - campaign.entregas < 1) return true;
    return false;
  };

  const getStock = (campaign: Campaign) => {
    if (campaign.stock === null) return "Sin límite";
    if (campaign.entregas === null) return 0;
    return campaign.stock - campaign.entregas;
  };

  const handleCheckboxChange = (campaign: Campaign) => {
    const campaignId = campaign.id;

    if (!checkValues(campaign)) {
      setSelectedCampaigns((prev) => ({
        ...prev,
        [campaignId]: {
          ...prev[campaignId],
          selected: !prev[campaignId].selected,
        },
      }));
    }
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

  const isFormValid = () => {
    const selectedEntries = Object.entries(selectedCampaigns).filter(
      ([, val]) => val.selected,
    );
    if (selectedEntries.length === 0) return false;

    return selectedEntries.every(([campaignId, data]) => {
      const campaign = activeCampaigns?.find((c) => c.id === campaignId);
      if (!campaign) return false;

      let schema: DynamicFieldSchema[] = [];
      try {
        schema = JSON.parse(campaign.esquema_formulario || "[]");
      } catch {
        return true;
      }

      return schema.every((field) => {
        if (!field.requerido) return true;
        const value = data.answers[field.nombre];
        return (
          value !== null && value !== undefined && String(value).trim() !== ""
        );
      });
    });
  };

  const formAction = async (formData: FormData) => {
    setIsLoading(true);
    setIsDisabled(true);

    const campaignsToSubmit = Object.entries(selectedCampaigns)
      .filter(([, value]) => value.selected)
      .map(([id, value]) => {
        const campaign = activeCampaigns?.find((c) => c.id === id);

        const answers = { ...value.answers };

        return {
          id,
          campaignName: campaign?.nombre_campaña || "",
          campos_adicionales: JSON.stringify(answers),
          code: campaign?.code || "",
        };
      });

    if (campaignsToSubmit.length === 0) {
      toast.error("Debe seleccionar al menos una campaña");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    if (!isFormValid()) {
      toast.error("Complete todos los campos obligatorios");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    formData.append("campaigns", JSON.stringify(campaignsToSubmit));
    formData.append("rut", rut.toString());
    formData.append("observaciones", observaciones);

    if (!userId) {
      toast.error("Sesión invalida");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    const toastId = toast.loading("Guardando...");
    setTimeout(async () => {
      try {
        const response = await createEntrega(userId, formData);
        if (!response.success) {
          throw new Error(response.message);
        }
        toast.success(response.message, { id: toastId });
        closeModal();
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error al crear la entrega";
        toast.error(message, { id: toastId });
        setIsDisabled(false);
      } finally {
        setIsLoading(false);
      }
    }, 200);
  };

  return (
    <form
      action={formAction}
      className="flex select-none flex-col gap-3 px-0.5 pt-2"
    >
      <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-baseline justify-between border-b border-slate-200 bg-slate-50 pb-2">
          <h3 className="text-sm font-medium text-slate-700">
            Beneficios seleccionados
          </h3>
          <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {Object.values(selectedCampaigns).filter((v) => v.selected).length}{" "}
            seleccionadas
          </div>
        </div>

        <div className="space-y-3">
          {activeCampaigns?.map((campaign) => {
            const isSelected = !!selectedCampaigns[campaign.id]?.selected;
            const isOutOfStock = !!checkValues(campaign);

            return (
              <div
                key={campaign.id}
                className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:border-slate-300 ${
                  isSelected
                    ? "!border-blue-300 ring-2 ring-blue-200"
                    : isOutOfStock
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
                        : isOutOfStock
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
                        className={`cursor-pointer text-sm font-medium ${isOutOfStock ? "text-rose-400" : "text-slate-700"}`}
                      >
                        {campaign.nombre_campaña}
                      </label>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${isOutOfStock ? "border-rose-300 bg-rose-50 text-rose-500" : "border-gray-200 bg-gray-50 text-gray-600"}`}
                      >
                        Stock: {getStock(campaign)}
                      </span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-slate-100 bg-slate-50 p-3">
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

      <div className="flex grow flex-col gap-1">
        <label htmlFor="observaciones" className="text-xs text-slate-500">
          Justificación
          <span className="text-slate-400"> (opcional)</span>
        </label>
        <textarea
          name="observaciones"
          id="observaciones"
          rows={4}
          maxLength={450}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Se realiza esta entrega a causa de..."
          className="min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-[13px] placeholder:text-slate-400 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        ></textarea>
        <div className="mt-0.5 flex justify-end">
          <span className="text-xs text-slate-500">
            {observaciones.length}/450 caracteres
          </span>
        </div>
      </div>

      <div className="mt-1 flex">
        <SubmitButton isDisabled={isDisabled || !isFormValid()}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </div>
    </form>
  );
}
