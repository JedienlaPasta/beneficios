"use client";
import { createEntrega } from "@/app/lib/actions/entregas";
import { getReceiverByRut } from "@/app/lib/actions/rsh";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Input from "../../campañas/new-campaign-modal/NewCampaignInput";
import { SubmitButton } from "../../SubmitButton";
import { capitalize, capitalizeAll } from "@/app/lib/utils/format";
import ComboboxInput from "./ComboboxInput";

import { HiOutlineRefresh } from "react-icons/hi";
import { DynamicFieldsRenderer } from "./DynamicFieldsRenderer";
import {
  DynamicFieldSchema,
  FormValue,
  NewModalFormProps,
} from "./NewModalForm";
import { ActiveCampaignsForEntregas } from "@/app/lib/data/campanas";

const OPCIONES_PARENTESCO = [
  "Representante de Organización",
  "Mamá",
  "Papá",
  "Abuelo",
  "Abuela",
  "Tutor Legal",
  "Hermano",
  "Hermana",
];

export default function NewModalFormReceiver({
  activeCampaigns,
  rut,
  userId,
}: NewModalFormProps) {
  const router = useRouter();

  // Estados del Receptor
  const [rutReceiver, setRutReceiver] = useState("");
  const [nombresReceiver, setNombresReceiver] = useState("");
  const [apellidosReceiver, setApellidosReceiver] = useState("");
  const [telefonoReceiver, setTelefonoReceiver] = useState("");
  const [direccionReceiver, setDireccionReceiver] = useState("");
  const [parentesco, setParentesco] = useState("");

  const [observaciones, setObservaciones] = useState("");

  // Estados de UI
  const [isSearching, setIsSearching] = useState(false); // Estado para el spinner
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

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

  // Búsqueda de Receptor
  const handleSearchReceiver = async () => {
    if (!rutReceiver || rutReceiver.length < 8) {
      toast.error("Ingrese un RUT válido para buscar");
      return;
    }

    setIsSearching(true);
    try {
      const response = await getReceiverByRut(rutReceiver);

      if (response.success && response.data) {
        setNombresReceiver(response.data.nombres);
        setApellidosReceiver(response.data.apellidos);
        setTelefonoReceiver(response.data.telefono);
        setDireccionReceiver(response.data.direccion);
        toast.success("Datos encontrados y cargados");
      } else {
        toast.warning(response.message || "Persona no encontrada en registros");
      }
    } catch (error) {
      console.error("Error al buscar datos:", error);
      toast.error("Error al buscar datos");
    } finally {
      setIsSearching(false);
    }
  };

  const isOutOfStock = (campaign: ActiveCampaignsForEntregas) => {
    // Si stock es null, es "infinito" o "sin limite"
    if (campaign.stock === null) return false;
    const entregasRealizadas = campaign.entregas ?? 0;

    // Stock disponible
    const remaining = campaign.stock - entregasRealizadas;

    // Si queda menos de 1, está sin stock
    return remaining < 1;
  };

  const getStockLabel = (campaign: ActiveCampaignsForEntregas) => {
    if (campaign.stock === null) return "Sin límite";
    if (campaign.entregas === null) return 0;
    return campaign.stock - campaign.entregas;
  };

  // Handlers
  const handleCheckboxChange = (campaign: ActiveCampaignsForEntregas) => {
    const campaignId = campaign.id;
    if (!isOutOfStock(campaign)) {
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

  // Formateo RUT
  const formatRutLive = (input: string) => {
    const cleaned = input.replace(/[^0-9kK]/g, "").toUpperCase();
    if (!cleaned) return { display: "", rutDigits: "" };
    const maybeDv = cleaned.slice(-1);
    const hasDv = cleaned.length > 1 && /[0-9K]/.test(maybeDv);
    const rutDigits = hasDv ? cleaned.slice(0, -1) : cleaned;
    const withDots = rutDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const display = hasDv ? `${withDots}-${maybeDv}` : withDots;
    return { display, rutDigits };
  };

  const countRutDigits = (formatted: string) =>
    formatted.replace(/[^0-9kK]/g, "").length;

  // Validación
  const isFormValid = () => {
    const selectedEntries = Object.entries(selectedCampaigns).filter(
      ([, v]) => v.selected,
    );
    if (selectedEntries.length === 0) return false;

    if (countRutDigits(rutReceiver) < 8) return false;
    if (nombresReceiver.trim() === "") return false;
    if (apellidosReceiver.trim() === "") return false;
    // if (telefonoReceiver.trim() === "") return false;
    // if (direccionReceiver.trim() === "") return false;
    if (parentesco.trim() === "") return false;

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

    formData.append("rut_receptor", rutReceiver.toString().toUpperCase());
    formData.append(
      "nombres_receptor",
      capitalizeAll(nombresReceiver.toString()),
    );
    formData.append(
      "apellidos_receptor",
      capitalizeAll(apellidosReceiver.toString()),
    );
    formData.append("telefono_receptor", telefonoReceiver.toString());
    formData.append(
      "direccion_receptor",
      capitalizeAll(direccionReceiver.toString()),
    );
    formData.append("parentesco_receptor", capitalize(parentesco.toString()));

    if (!userId) {
      toast.error("Sesión invalida");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    const toastId = toast.loading("Guardando...");

    try {
      const response = await createEntrega(userId, formData);
      if (!response.success) throw new Error(response.message);

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
  };

  return (
    <form
      action={formAction}
      className="flex select-none flex-col justify-center gap-3 px-0.5 pt-1"
    >
      {/* SECCIÓN DATOS RECEPTOR */}
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-medium text-slate-700">
          Datos del receptor
        </h4>
        <button
          type="button"
          onClick={handleSearchReceiver}
          disabled={isSearching}
          className="rounded-full p-1 hover:bg-slate-100 disabled:opacity-50"
          title="Buscar datos por RUT"
        >
          <HiOutlineRefresh
            className={`h-5 w-5 text-blue-600 transition-all ${isSearching ? "animate-loadspin-inverted" : ""}`}
          />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeHolder="12345678-9"
          label="RUT"
          type="text"
          nombre="rut_receiver"
          value={rutReceiver}
          setData={(raw) => {
            const { display } = formatRutLive(raw);
            setRutReceiver(display);
          }}
          required
        />
        <Input
          placeHolder="+569 1234 5678"
          label="Teléfono"
          type="text"
          nombre="telefono_receiver"
          value={telefonoReceiver}
          setData={setTelefonoReceiver}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeHolder="Juan Andrés..."
          label="Nombres"
          type="text"
          nombre="nombres_receiver"
          value={nombresReceiver}
          setData={setNombresReceiver}
          required
        />
        <Input
          placeHolder="Pérez González..."
          label="Apellidos"
          type="text"
          nombre="apellidos_receiver"
          value={apellidosReceiver}
          setData={setApellidosReceiver}
          required
        />
      </div>

      <Input
        placeHolder="Av. Principal 123..."
        label="Dirección"
        type="text"
        nombre="direccion_receiver"
        value={direccionReceiver}
        setData={setDireccionReceiver}
      />

      <ComboboxInput
        label="Parentesco / Relación"
        placeholder="Seleccione o escriba..."
        value={parentesco}
        onChange={setParentesco}
        options={OPCIONES_PARENTESCO}
        required
        name="parentesco_receptor"
      />

      {/* SECCIÓN CAMPAÑAS */}
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
            const outOfStock = isOutOfStock(campaign);

            return (
              <div
                key={campaign.id}
                className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:border-slate-300 ${
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
                        className={`rounded-full border px-2 py-0.5 text-xs ${outOfStock ? "border-rose-300 bg-rose-50 text-rose-500" : "border-gray-200 bg-gray-50 text-gray-600"}`}
                      >
                        Stock: {getStockLabel(campaign)}
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
          rows={3}
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

      <div className="mt-2 flex">
        <SubmitButton isDisabled={isDisabled || !isFormValid()}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </div>
    </form>
  );
}
