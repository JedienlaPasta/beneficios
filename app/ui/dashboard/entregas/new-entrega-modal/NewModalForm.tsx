"use client";
import { toast } from "sonner";
import Input from "../../campañas/new-campaign-input";
import { SubmitButton } from "../../submit-button";
import { useState } from "react";
import { Campaign } from "@/app/lib/definitions";
import { createEntrega } from "@/app/lib/actions/entregas";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

type DynamicFieldSchema = {
  nombre: string;
  label: string;
  tipo: "text" | "number" | "select" | "boolean";
  opciones?: string[];
  requerido: boolean;
};

type NewModalFormProps = {
  activeCampaigns?: Campaign[];
  rut: string;
  userId: string;
};

// --- COMPONENTE PRINCIPAL ---
export default function NewModalForm({
  activeCampaigns,
  rut,
  userId,
}: NewModalFormProps) {
  const router = useRouter();
  const [observaciones, setObservaciones] = useState("");
  const [lastSelection, setLastSelection] = useState("");

  // ESTADO ACTUALIZADO: Ahora guardamos un objeto 'answers' dinámico
  const [selectedCampaigns, setSelectedCampaigns] = useState<{
    [campaignId: string]: {
      selected: boolean;
      answers: Record<string, any>; // Ej: { talla: "M", cantidad: 2 }
    };
  }>(() => {
    if (activeCampaigns && activeCampaigns.length > 0) {
      return activeCampaigns.reduce(
        (acc, campaign) => {
          acc[campaign.id] = {
            selected: false,
            answers: {}, // Inicialmente vacío
          };
          return acc;
        },
        {} as {
          [key: string]: { selected: boolean; answers: Record<string, any> };
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

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Update this line to use the userId prop directly
  const createEntregaWithId = createEntrega.bind(null, userId);

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
    setLastSelection(campaignId);

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

  // NUEVA FUNCIÓN: Maneja cambios en campos dinámicos específicos
  const handleFieldChange = (
    campaignId: string,
    fieldName: string,
    value: any,
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

  // VALIDACIÓN DINÁMICA
  const isFormValid = () => {
    // 1. Al menos una seleccionada
    const selectedEntries = Object.entries(selectedCampaigns).filter(
      ([, val]) => val.selected,
    );
    if (selectedEntries.length === 0) return false;

    // 2. Validar campos requeridos dinámicos
    return selectedEntries.every(([campaignId, data]) => {
      const campaign = activeCampaigns?.find((c) => c.id === campaignId);
      if (!campaign) return false;

      let schema: DynamicFieldSchema[] = [];
      try {
        schema = JSON.parse(campaign.esquema_formulario || "[]");
      } catch {
        return true;
      } // Si falla el esquema, asumimos válido (o inválido según prefieras)

      // Verificar que cada campo requerido tenga valor en 'answers'
      return schema.every((field) => {
        if (!field.requerido) return true;
        const value = data.answers[field.nombre];
        // Chequeo simple: no null, no undefined, no string vacío
        return (
          value !== null && value !== undefined && String(value).trim() !== ""
        );
      });
    });
  };

  const formAction = async (formData: FormData) => {
    setIsLoading(true);
    setIsDisabled(true);

    // Preparar datos para el Server Action
    const campaignsToSubmit = Object.entries(selectedCampaigns)
      .filter(([, value]) => value.selected)
      .map(([id, value]) => {
        const campaign = activeCampaigns?.find((c) => c.id === id);

        // Separamos el 'codigo_entrega' (si existe en los inputs dinámicos) del resto del JSON
        const answers = { ...value.answers };
        const codigoEntrega = answers["codigo_entrega"] || ""; // Buscamos si hay un campo con este slug

        // El resto se va al JSON de campos adicionales
        // (Opcional: puedes borrar codigo_entrega de answers si no quieres duplicarlo en el JSON)

        return {
          id,
          campaignName: campaign?.nombre_campaña || "",
          // EL CAMBIO CLAVE: Enviamos el objeto completo stringified
          campos_adicionales: JSON.stringify(answers),
          code: codigoEntrega || campaign?.code || "", // Prioridad al input manual, luego al default
        };
      });

    if (campaignsToSubmit.length === 0) {
      toast.error("Debe seleccionar al menos una campaña");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    // Ya validamos con isFormValid, pero doble chequeo de seguridad
    if (!isFormValid()) {
      toast.error("Complete todos los campos obligatorios");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    formData.append("campaigns", JSON.stringify(campaignsToSubmit));
    formData.append("rut", rut.toString());
    formData.append("observaciones", observaciones);

    const toastId = toast.loading("Guardando...");
    setTimeout(async () => {
      try {
        const response = await createEntregaWithId(formData);
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
      } finally {
        setIsLoading(false);
        setIsDisabled(false);
      }
    }, 200);
  };

  // Check if form is valid
  // const isFormValid = () => {
  //   // Check if any campaigns are selected
  //   const selectedCount = Object.values(selectedCampaigns).filter(
  //     (v) => v.selected,
  //   ).length;

  //   if (selectedCount === 0) return false;

  //   // Check if all selected campaigns have details
  //   const hasEmptyDetails = Object.entries(selectedCampaigns)
  //     .filter(
  //       ([, value]: [string, { selected: boolean; detail: string }]) =>
  //         value.selected,
  //     )
  //     .some(
  //       ([campaignId, value]: [
  //         string,
  //         { selected: boolean; detail: string },
  //       ]) => {
  //         const campaign = activeCampaigns?.find((c) => c.id === campaignId);
  //         const detail = value.detail.trim();

  //         // Special validation for "Tarjeta de Comida"
  //         if (campaign?.nombre_campaña === "Tarjeta de Comida") {
  //           const invalidValues = ["", "N", "NN"];
  //           if (invalidValues.includes(detail)) {
  //             return true;
  //           }
  //           // Regex to validate it starts with "NN" & is followed by numbers
  //           const validFormat = /^NN\w+$/.test(detail);
  //           return !validFormat; // Invalid if doesnt start with "NN" & is not followed by numbers
  //         }

  //         // For other campaigns, validate if it's not empty
  //         return detail === "";
  //       },
  //     );

  //   return !hasEmptyDetails;
  // };

  return (
    <form action={formAction} className="flex select-none flex-col gap-5 pt-2">
      <div className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 scrollbar-hide">
        <div className="justify- mb-4 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-slate-700">
            Beneficios seleccionados:
          </h3>
          <div className="text-xs text-slate-500">
            {Object.values(selectedCampaigns).filter((v) => v.selected).length}{" "}
            seleccionadas
          </div>
        </div>

        <div className="space-y-3">
          {activeCampaigns?.map((campaign) => (
            <div
              key={campaign.id}
              className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:border-slate-300 ${
                selectedCampaigns[campaign.id]?.selected
                  ? "!border-blue-300 ring-blue-300"
                  : lastSelection === campaign.id && checkValues(campaign)
                    ? "!border-rose-300"
                    : "!border-slate-200"
              }`}
            >
              <div
                className="flex cursor-pointer items-start gap-3 p-3"
                onClick={() => handleCheckboxChange(campaign)}
              >
                {/* Checkbox visual */}
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    selectedCampaigns[campaign.id]?.selected
                      ? "border-blue-500 bg-blue-500"
                      : lastSelection === campaign.id && checkValues(campaign)
                        ? "border-rose-300 bg-white"
                        : "border-slate-300 bg-white"
                  }`}
                >
                  {selectedCampaigns[campaign.id]?.selected && (
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

                {/* Info Campaña */}
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      className={`cursor-pointer text-sm font-medium ${
                        lastSelection === campaign.id && checkValues(campaign)
                          ? "text-rose-500"
                          : "text-slate-700"
                      }`}
                    >
                      {campaign.nombre_campaña}
                    </label>
                    <span
                      className={`rounded-full bg-slate-100 px-2 py-0.5 text-xs ${
                        lastSelection === campaign.id && checkValues(campaign)
                          ? "text-rose-500"
                          : "text-slate-600"
                      }`}
                    >
                      {typeof getStock(campaign) === "number"
                        ? ` Stock: ${getStock(campaign)}`
                        : "Sin límite"}
                    </span>
                  </div>
                </div>
              </div>

              {/* ÁREA DESPLEGABLE DINÁMICA */}
              <AnimatePresence>
                {selectedCampaigns[campaign.id]?.selected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-100 bg-slate-50 p-4">
                      {/* AQUÍ ESTÁ LA MAGIA: Renderizamos los campos según el JSON */}
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
          ))}

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
        </label>
        <textarea
          name="observaciones"
          id="observaciones"
          rows={4}
          maxLength={390}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Justificación..."
          className="w-full rounded-lg border border-slate-300 bg-transparent bg-white px-4 py-2 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus-within:border-blue-500"
        ></textarea>
      </div>

      <div className="mt-1 flex">
        <SubmitButton isDisabled={isDisabled || !isFormValid()}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </div>
    </form>
  );
}

// --- SUB-COMPONENTE PARA RENDERIZAR CAMPOS DINÁMICOS ---
const DynamicFieldsRenderer = ({
  schemaString,
  values,
  onChange,
}: {
  schemaString: string;
  values: Record<string, any>;
  onChange: (fieldName: string, value: any) => void;
}) => {
  let schema: DynamicFieldSchema[] = [];
  try {
    schema = JSON.parse(schemaString || "[]");
  } catch (e) {
    console.error("Error parsing schema", e);
    return (
      <p className="text-xs text-red-500">Error en configuración de campaña</p>
    );
  }

  if (schema.length === 0) {
    return (
      <p className="text-xs italic text-slate-400">
        Sin datos adicionales requeridos.
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {schema.map((field) => {
        return (
          <div
            key={field.nombre}
            className={field.tipo === "select" ? "col-span-1" : "col-span-1"}
          >
            {field.tipo === "select" ? (
              <div className="flex flex-col gap-1">
                <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                  {field.label} {field.requerido && "*"}
                </label>
                <select
                  className="w-full border-b border-slate-200 bg-transparent py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                  value={values[field.nombre] || ""}
                  onChange={(e) => onChange(field.nombre, e.target.value)}
                >
                  <option value="" disabled>
                    Seleccione...
                  </option>
                  {field.opciones?.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Input
                placeHolder={`Ingrese ${field.label.toLowerCase()}...`}
                label={field.label} // Usamos el label real configurado
                type={field.tipo === "number" ? "number" : "text"} // Mapeo simple de tipos
                nombre={field.nombre}
                value={values[field.nombre] || ""}
                setData={(val) => onChange(field.nombre, val)}
                required={field.requerido}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
