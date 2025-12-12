"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createCampaign } from "@/app/lib/actions/campana";
import Input from "@/app/ui/dashboard/campañas/new-campaign-input";
import CampaignDropdown from "@/app/ui/dashboard/campañas/campaign-dropdown";
import { SubmitButton } from "../submit-button";
import { Requirements } from "./[id]/update/update-form";
// import DataTypeCards from "./[id]/update/data-type-cards";
import RequirementsCard from "./[id]/update/requirements-cards";
import dayjs from "dayjs";
import CustomAntdDatePicker from "@/app/ui/dashboard/datepicker";
import { campaignsList } from "@/app/lib/data/static-data";
import CloseModalButton from "../close-modal-button";

export type FormState = {
  success?: boolean;
  message?: string;
};

// Definición de tipos para los campos dinámicos
type DynamicField = {
  id: number;
  label: string;
  nombre: string; // slug interno (ej: cantidad_paquetes)
  tipo: "text" | "number" | "select" | "boolean";
  opciones: string; // string separado por comas para editar
  requerido: boolean;
  isCustomLabel?: boolean;
};

const PREDEFINED_LABELS = [
  "Código",
  "Monto",
  "Talla",
  "Cantidad",
  "Observación",
  "Empresa",
  "N° de Vale",
];

export default function NewCampaignModal() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [campaignName, setCampaignName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [stock, setStock] = useState("");
  const [code, setCode] = useState("");

  // Campos Dinámicos
  const [dynamicFields, setDynamicFields] = useState<DynamicField[]>([
    {
      id: 1,
      label: "Código",
      nombre: "codigo_entrega",
      tipo: "text",
      opciones: "",
      requerido: true,
    },
  ]);

  const [criteria, setCriteria] = useState<Requirements>({
    tramo: Boolean(false),
    discapacidad: Boolean(false),
    adultoMayor: Boolean(false),
  });

  // Genera un nombre técnico (slug) automáticamente al escribir el Label
  const generateNameFromLabel = (label: string) => {
    return label
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  const addEmptyField = () => {
    setDynamicFields([
      ...dynamicFields,
      {
        id: Date.now(),
        label: "",
        nombre: "",
        tipo: "text",
        opciones: "",
        requerido: false,
      },
    ]);
  };

  const removeField = (id: number) => {
    setDynamicFields(dynamicFields.filter((field) => field.id !== id));
  };

  const updateField = <K extends keyof DynamicField>(
    id: number,
    field: K,
    value: DynamicField[K],
  ) => {
    setDynamicFields((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };

          if (field === "label" && typeof value === "string") {
            updatedItem.nombre = generateNameFromLabel(value);
          }

          return updatedItem;
        }
        return item;
      }),
    );
  };

  // --- PRESETS / PLANTILLAS ---
  // Esto reemplaza la lógica simple de antes. Ahora carga estructuras completas.
  const handleCampaignNameSelection = (value: string) => {
    setCampaignName(value);

    // Configuración Base
    if (value === "Tarjeta de Comida") {
      setCode("TA");
      setDynamicFields([
        {
          id: Date.now(),
          label: "Código Tarjeta",
          nombre: "codigo_entrega",
          tipo: "text",
          opciones: "",
          requerido: true,
        },
        {
          id: Date.now() + 1,
          label: "Monto",
          nombre: "monto",
          tipo: "number",
          opciones: "",
          requerido: true,
        },
      ]);
    } else if (value === "Vale de Gas") {
      setCode("GA");
      setDynamicFields([
        {
          id: Date.now(),
          label: "N° de Vale",
          nombre: "codigo_entrega",
          tipo: "text",
          opciones: "",
          requerido: true,
        },
        {
          id: Date.now() + 1,
          label: "Empresa",
          nombre: "empresa",
          tipo: "select",
          opciones: "Lipigas, Abastible, Gasco",
          requerido: true,
        },
      ]);
    } else if (value === "Pañales") {
      setCode("PA");
      setDynamicFields([
        {
          id: Date.now(),
          label: "Talla",
          nombre: "talla",
          tipo: "select",
          opciones: "RN, P, M, G, XG, XXG",
          requerido: true,
        },
        {
          id: Date.now() + 1,
          label: "Paquetes",
          nombre: "cantidad_paquetes",
          tipo: "number",
          opciones: "",
          requerido: true,
        },
        {
          id: Date.now() + 2,
          label: "Unidades Totales",
          nombre: "cantidad_unidades",
          tipo: "number",
          opciones: "",
          requerido: true,
        },
      ]);
    } else {
      // Default limpia o deja uno genérico
      setCode("");
      setDynamicFields([
        {
          id: Date.now(),
          label: "Código / Detalle",
          nombre: "codigo_entrega",
          tipo: "text",
          opciones: "",
          requerido: true,
        },
      ]);
    }
  };

  // Estructura normal
  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("modal", "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // const handleCampaignNameSelection = (value: string) => {
  //   setCampaignName(value);
  //   if (value === "Tarjeta de Comida") {
  //     setCode("TA");
  //     setFieldType(["Código"]);
  //   } else if (value === "Vale de Gas") {
  //     setCode("GA");
  //     setFieldType(["Código"]);
  //   } else if (value === "Pañales") {
  //     setCode("PA");
  //     setFieldType(["Talla"]);
  //   }
  // };

  const handleStockChange = (
    e: React.ChangeEvent<HTMLInputElement> | string,
  ) => {
    const value = typeof e === "string" ? e : e.target?.value || "";
    if (value === "" || /^[0-9]*$/.test(value)) {
      setStock(value);
    }
  };

  const datePickerHandler = (pickerDate: dayjs.Dayjs | null) => {
    if (pickerDate) {
      setDate(pickerDate.toDate());
    } else {
      setDate(null);
    }
  };

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Form validation
  const isFormValid = () => {
    return (
      campaignName.trim() !== "" &&
      code.trim() !== "" &&
      date !== null &&
      dynamicFields.length > 0 // Que al menos haya un campo configurado
    );
  };

  const formAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    // Preparar el esquema para la BD
    // Convertimos el string de opciones "A, B" a array ["A", "B"]
    const esquemaFinal = dynamicFields.map((field) => ({
      nombre: field.nombre,
      label: field.label,
      tipo: field.tipo,
      requerido: field.requerido,
      opciones:
        field.tipo === "select" && field.opciones
          ? field.opciones.split(",").map((s) => s.trim())
          : undefined,
    }));

    const myFormData = new FormData();
    myFormData.append("nombre", campaignName);
    myFormData.append("fechaTermino", date?.toString() || "");
    myFormData.append("code", code.toString() || "");
    myFormData.append("stock", stock.toString());

    myFormData.append("esquema_formulario", JSON.stringify(esquemaFinal));

    myFormData.append("tramo", criteria.tramo.toString());
    myFormData.append("discapacidad", criteria.discapacidad.toString());
    myFormData.append("adultoMayor", criteria.adultoMayor.toString());

    const toastId = toast.loading("Guardando...");
    try {
      const response = await createCampaign(myFormData);
      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success(response.message, { id: toastId });
      setIsLoading(false);
      setTimeout(closeModal, 300);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(message, { id: toastId });
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  return (
    <div className="flex max-h-full w-[40rem] max-w-full shrink-0 flex-col overflow-hidden rounded-xl bg-white p-8 shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Crear Campaña</h2>
        <CloseModalButton name="modal" />
      </div>
      <p className="text-xs text-gray-500">
        Configura los datos generales y estructura el formulario de entrega.
      </p>

      <div className="overflow-y-auto pr-2 scrollbar-hide">
        <form
          onSubmit={formAction}
          className="mt-4 flex flex-col gap-5 bg-white"
        >
          {/* SECCIÓN 1: DATOS GENERALES */}
          <CampaignDropdown
            label="Campaña (Plantilla)"
            name={"nombre"}
            campaignsList={campaignsList}
            campaignName={campaignName}
            setCampaign={handleCampaignNameSelection}
          />

          <div className="flex items-end gap-3">
            <div className="grow">
              <Input
                placeHolder="Stock..."
                label="Stock Inicial"
                type="text"
                nombre="stock"
                value={stock}
                setData={(e) => handleStockChange(e)}
              />
            </div>
            <div className="grow">
              <Input
                required={true}
                placeHolder="Código..."
                label="Código Campaña"
                type="text"
                nombre="descripcion"
                value={code}
                setData={setCode}
              />
            </div>
            <CampaignCode descripcion={code ? code.toUpperCase() : "##"} />
          </div>

          <CustomAntdDatePicker
            label="Término"
            value={date ? dayjs(date) : null}
            placeholder="Seleccione una fecha"
            setDate={datePickerHandler}
          />

          {/* SECCIÓN 2: CONSTRUCTOR DE FORMULARIO (Reemplaza DataTypeCards) */}
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                Configuración del Formulario de Entrega
              </p>
              <button
                type="button"
                onClick={addEmptyField}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                + Agregar Campo
              </button>
            </div>

            <div className="mt-2 flex flex-col gap-2">
              {dynamicFields.length === 0 && (
                <p className="py-2 text-center text-xs italic text-slate-400">
                  No hay campos definidos.
                </p>
              )}

              {dynamicFields.map((field) => (
                <div
                  key={field.id}
                  className="group relative flex flex-col gap-2 rounded border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Etiqueta
                      </label>

                      {/* CONDICIONAL: ¿Es Custom o es Select? */}
                      {field.isCustomLabel ? (
                        // MODO MANUAL (INPUT)
                        <div className="relative">
                          <input
                            type="text"
                            value={field.label}
                            autoFocus // Para que escriban de inmediato al cambiar
                            onChange={(e) =>
                              updateField(field.id, "label", e.target.value)
                            }
                            placeholder="Escribe el nombre del campo..."
                            className="w-full border-b border-blue-500 bg-blue-50/50 py-1 pr-6 text-sm text-blue-900 outline-none transition-colors placeholder:text-blue-300"
                          />
                          {/* Botón para volver al Select (X) */}
                          <button
                            type="button"
                            onClick={() => {
                              // Limpiamos el valor y desactivamos modo custom
                              updateField(field.id, "label", "Código");
                              updateField(field.id, "isCustomLabel", false);
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent p-1 text-xs text-blue-400 hover:text-blue-600"
                            title="Volver a lista predeterminada"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        // MODO LISTA (SELECT) - Visualmente igual al de "Tipo"
                        <select
                          value={
                            PREDEFINED_LABELS.includes(field.label)
                              ? field.label
                              : "custom_option"
                          }
                          onChange={(e) => {
                            if (e.target.value === "custom_option") {
                              // Activar modo manual
                              updateField(field.id, "label", "");
                              updateField(field.id, "isCustomLabel", true);
                            } else {
                              // Seleccionar predeterminado
                              updateField(field.id, "label", e.target.value);
                            }
                          }}
                          className="w-full cursor-pointer border-b border-slate-200 bg-transparent py-1 text-sm outline-none focus:border-blue-500"
                        >
                          <option value="" disabled>
                            Seleccionar...
                          </option>
                          {PREDEFINED_LABELS.map((lbl) => (
                            <option key={lbl} value={lbl}>
                              {lbl}
                            </option>
                          ))}
                          <option
                            value="custom_option"
                            className="bg-blue-50 font-semibold text-blue-600"
                          >
                            + Otro / Personalizado...
                          </option>
                        </select>
                      )}
                    </div>
                    <div className="w-1/3">
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Tipo
                      </label>
                      <select
                        value={field.tipo}
                        onChange={(e) =>
                          updateField(
                            field.id,
                            "tipo",
                            e.target.value as DynamicField["tipo"],
                          )
                        }
                        className="w-full border-b border-slate-200 bg-transparent py-1 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="select">Selección</option>
                        <option value="boolean">Si/No</option>
                      </select>
                    </div>
                  </div>

                  {/* Opciones extra para Select */}
                  {field.tipo === "select" && (
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-400">
                        Opciones (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={field.opciones}
                        onChange={(e) =>
                          updateField(field.id, "opciones", e.target.value)
                        }
                        placeholder="Ej: S, M, L, XL"
                        className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs"
                      />
                    </div>
                  )}

                  <div className="mt-1 flex items-center justify-between">
                    <label className="flex cursor-pointer items-center gap-1">
                      <input
                        type="checkbox"
                        checked={field.requerido}
                        onChange={(e) =>
                          updateField(field.id, "requerido", e.target.checked)
                        }
                        className="h-3 w-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs text-slate-500">
                        Obligatorio
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeField(field.id)}
                      className="text-xs text-red-400 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECCIÓN 3: CRITERIOS */}
          <div className="flex flex-col gap-1">
            <p className="text-xs text-slate-500">Criterios de Aceptación</p>
            <div className="grid grid-cols-1 gap-3">
              <RequirementsCard
                isMarked={criteria.tramo}
                name={"tramo"}
                setIsMarked={setCriteria}
                description="Hasta 40%"
              >
                Tramo
              </RequirementsCard>
              <RequirementsCard
                isMarked={criteria.discapacidad}
                name={"discapacidad"}
                setIsMarked={setCriteria}
                description="Discapacidad o dependencia"
              >
                Discapacidad
              </RequirementsCard>
              <RequirementsCard
                isMarked={criteria.adultoMayor}
                name={"adultoMayor"}
                setIsMarked={setCriteria}
                description="60 Años o Más"
              >
                Adulto Mayor
              </RequirementsCard>
            </div>
          </div>

          <SubmitButton isDisabled={isDisabled || !isFormValid()}>
            {isLoading ? "Guardando..." : "Guardar"}
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}

function CampaignCode({ descripcion }: { descripcion: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500 text-white">
      {descripcion}
    </span>
  );
}
