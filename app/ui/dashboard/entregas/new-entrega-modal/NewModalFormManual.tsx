"use client";
import { createEntregaManual } from "@/app/lib/actions/entregas";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Input from "../../campañas/new-campaign-modal/NewCampaignInput";
import { SubmitButton } from "../../SubmitButton";
import CustomAntdDatePicker from "../../Datepicker";
import dayjs from "dayjs";
import UserDropdown from "./UserDropdown";
import {
  DynamicFieldSchema,
  FormValue,
  NewModalFormProps,
} from "./NewModalForm";
import CampaignsSelectionList from "./CampaignsSelectionList";

// --- COMPONENTE PRINCIPAL ---
export default function NewModalFormManual({
  activeCampaigns,
  rut,
}: NewModalFormProps) {
  const router = useRouter();

  // Estados propios de Manual
  const [folio, setFolio] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState<Date | null>(null);
  const [encargado, setEncargado] = useState({ nombre: "", correo: "" });

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
                field.nombre === "cantidad" ||
                field.label.toLowerCase() === "cantidad"
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

  const fechaEntregaHandler = (pickerDate: dayjs.Dayjs | null) => {
    if (pickerDate) setFechaEntrega(pickerDate.toDate());
    else setFechaEntrega(null);
  };

  // Validación
  const isFormValid = () => {
    if (!fechaEntrega) return false;
    if (folio.trim().length < 2) return false;
    if (encargado.correo.trim() === "") return false;

    const selectedEntries = Object.entries(selectedCampaigns).filter(
      ([, v]) => v.selected,
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

  // Submit Action
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

    if (!isFormValid()) {
      toast.error("Complete todos los campos requeridos");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    formData.append("campaigns", JSON.stringify(campaignsToSubmit));
    formData.append("rut", rut.toString());
    formData.append("observaciones", observaciones);
    formData.append("fecha_entrega", fechaEntrega?.toISOString() || "");
    formData.append("folio", folio.toString().toUpperCase());
    formData.append("correo_encargado", encargado.correo);

    const toastId = toast.loading("Registrando entrega manual...");

    try {
      const response = await createEntregaManual(formData);
      if (!response.success) throw new Error(response.message);

      toast.success(response.message, { id: toastId });
      closeModal();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al registrar entrega";
      toast.error(message, { id: toastId });
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      action={formAction}
      className="flex select-none flex-col justify-center gap-3 px-0.5 pt-2"
    >
      {/* Datos Manuales */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeHolder="Ej: 1024-25-TA"
          label="Folio"
          type="text"
          nombre="folio"
          value={folio}
          setData={setFolio}
          required
        />
        <CustomAntdDatePicker
          label="Fecha de Entrega"
          placeholder="Seleccione fecha"
          setDate={fechaEntregaHandler}
          value={fechaEntrega ? dayjs(fechaEntrega) : null}
          required
        />
      </div>

      <UserDropdown
        placeHolder="Selecciona quien entregó..."
        label="Funcionario Encargado"
        name="correo"
        userEmail={encargado.correo}
        setUserEmail={(email) => setEncargado({ ...encargado, correo: email })}
        required
      />

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
          rows={3}
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

      <div className="mt-2 flex">
        <SubmitButton isDisabled={isDisabled || !isFormValid()}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </div>
    </form>
  );
}
