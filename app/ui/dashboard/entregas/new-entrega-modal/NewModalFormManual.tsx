"use client";
import { createEntregaManual } from "@/app/lib/actions/entregas";
import { Campaign } from "@/app/lib/definitions";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation"; // Router sí se usa para refresh
import { useRef, useState } from "react";
import { toast } from "sonner";
import Input from "../../campañas/new-campaign-input";
import { SubmitButton } from "../../submit-button";
import CustomAntdDatePicker from "../../datepicker";
import dayjs from "dayjs";
import UserDropdown from "../user-dropdown";

// --- TIPOS ---
type FormValue = string | number | boolean | null | undefined;

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
  // userId eliminado porque no se usa en este form específico
};

// --- SUB-COMPONENTE RENDERIZADOR ---
const DynamicFieldsRenderer = ({
  schemaString,
  values,
  onChange,
}: {
  schemaString: string;
  values: Record<string, FormValue>; // Fix: Usamos FormValue en vez de any
  onChange: (fieldName: string, value: FormValue) => void;
}) => {
  let schema: DynamicFieldSchema[] = [];
  try {
    schema = JSON.parse(schemaString || "[]");
  } catch {
    // Fix: Removido 'e' unused
    return <p className="text-xs text-red-500">Error en esquema</p>;
  }

  if (schema.length === 0) {
    return (
      <p className="text-xs italic text-slate-400">Sin datos adicionales.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {schema.map((field) => (
        <div key={field.nombre} className="col-span-1">
          {field.tipo === "select" ? (
            <div className="flex flex-col gap-1">
              <label className="ml-1 text-[10px] font-bold uppercase text-slate-400">
                {field.label} {field.requerido && "*"}
              </label>
              <select
                className="w-full border-b border-slate-200 bg-transparent py-1.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                value={String(values[field.nombre] || "")} // Aseguramos string
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
              label={field.label}
              type={field.tipo === "number" ? "number" : "text"}
              nombre={field.nombre}
              value={String(values[field.nombre] || "")} // Aseguramos string
              setData={(val) => onChange(field.nombre, val)}
              required={field.requerido}
            />
          )}
        </div>
      ))}
    </div>
  );
};

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
  const scrollRef = useRef<HTMLDivElement>(null);

  // Estado de Campañas (Dinámico)
  // Fix: Tipado explícito para 'answers'
  const [selectedCampaigns, setSelectedCampaigns] = useState<{
    [campaignId: string]: {
      selected: boolean;
      answers: Record<string, FormValue>;
    };
  }>(() => {
    if (activeCampaigns && activeCampaigns.length > 0) {
      return activeCampaigns.reduce(
        (acc, campaign) => {
          acc[campaign.id] = { selected: false, answers: {} };
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

  // Helpers
  const checkValues = (campaign: Campaign) => {
    if (campaign.stock === null || campaign.entregas === null) return false;
    if (campaign.stock - campaign.entregas < 1) return true;
    return false;
  };

  const getStock = (campaign: Campaign) => {
    if (campaign.stock === null) return 0;
    if (campaign.entregas === null) return 0;
    return campaign.stock - campaign.entregas;
  };

  // Handlers
  const handleCheckboxChange = (campaign: Campaign) => {
    const campaignId = campaign.id;
    // Fix: Removido setLastSelection (unused)
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

  // Fix: value ahora es FormValue
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
        const codigoEntrega = String(answers["codigo_entrega"] || ""); // Aseguramos string

        return {
          id,
          campaignName: campaign?.nombre_campaña || "",
          campos_adicionales: JSON.stringify(answers),
          code: codigoEntrega || campaign?.code || "",
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
    } finally {
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  return (
    <form action={formAction} className="flex select-none flex-col gap-5 pt-2">
      {/* Datos Manuales */}
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeHolder="Ej: 2024-001"
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

      {/* Listado de Campañas (Dinámico) */}
      <div
        ref={scrollRef}
        className="scrollbar-gutter-stable max-h-[380px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4"
      >
        <div className="sticky top-0 z-10 mb-3 flex items-baseline justify-between border-b border-slate-200 bg-slate-50 pb-2">
          <h3 className="text-sm font-medium text-slate-700">
            Beneficios entregados
          </h3>
          <div className="text-xs text-slate-500">
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
                      onAnimationStart={() => {
                        if (scrollRef.current)
                          scrollRef.current.scrollTop =
                            scrollRef.current.scrollTop;
                      }}
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
          rows={3}
          maxLength={390}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Se realiza esta entrega a causa de..."
          className="min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500"
        ></textarea>
      </div>

      <div className="mt-2 flex">
        <SubmitButton isDisabled={isDisabled || !isFormValid()}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </div>
    </form>
  );
}
