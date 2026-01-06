"use client";
import { toast } from "sonner";
import { SubmitButton } from "../../SubmitButton";
import { useState } from "react";
import { createEntrega } from "@/app/lib/actions/entregas";
import { useSearchParams, useRouter } from "next/navigation";
import { ActiveCampaignsForEntregas } from "@/app/lib/data/campanas";
import CampaignsSelectionList from "./CampaignsSelectionList";

export type FormValue = string | number | boolean | null | undefined;

export type DynamicFieldSchema = {
  nombre: string;
  label: string;
  tipo: "text" | "number" | "select" | "boolean";
  opciones?: string[];
  requerido: boolean;
};

export type NewModalFormProps = {
  activeCampaigns?: ActiveCampaignsForEntregas[];
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

  // Estado de Campañas (Dinámico)
  const [selectedCampaigns, setSelectedCampaigns] = useState<{
    [campaignId: string]: {
      selected: boolean;
      answers: Record<string, FormValue>;
    };
  }>(() => {
    if (activeCampaigns && activeCampaigns.length > 0) {
      return activeCampaigns.reduce(
        (acc, campaign) => {
          const defaultAnswers: Record<string, FormValue> = {};

          try {
            const schema = JSON.parse(campaign.esquema_formulario || "[]");
            schema.forEach((field: DynamicFieldSchema) => {
              // Si el campo es cantidad, valor por defecto 1
              if (
                (field.nombre === "cantidad" ||
                  field.label.toLowerCase() === "cantidad") &&
                campaign.code === "NA"
              ) {
                defaultAnswers[field.nombre] = 1;
              }
              // Si el campo es codigo, para la entrega de TA, valor por defecto "NN"
              else if (
                (field.nombre === "codigo_entrega" ||
                  field.label === "Código") &&
                campaign.code === "TA"
              ) {
                defaultAnswers[field.nombre] = "NN";
              }
            });
          } catch (e) {
            console.error("Error al parsear el esquema de la campaña:", e);
            toast.error("Error al parsear el esquema de la campaña");
          }

          acc[campaign.id] = {
            selected: false,
            answers: defaultAnswers,
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
      {/* Listado de Campañas (Dinámico) // Beneficios seleccionados */}
      <CampaignsSelectionList
        selectedCampaigns={selectedCampaigns}
        activeCampaigns={activeCampaigns}
        setSelectedCampaigns={setSelectedCampaigns}
      />

      <div className="flex grow flex-col gap-1">
        <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
          Justificación
          <span className="text-[10px] font-normal text-slate-400">
            {" "}
            (opcional)
          </span>
        </label>
        <textarea
          name="observaciones"
          id="observaciones"
          rows={4}
          maxLength={400}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Se realiza esta entrega a causa de..."
          className="min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-[13px] placeholder:text-slate-400 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        ></textarea>
        <div className="mt-0.5 flex justify-end">
          <span className="text-xs text-slate-500">
            {observaciones.length}/400 caracteres
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
