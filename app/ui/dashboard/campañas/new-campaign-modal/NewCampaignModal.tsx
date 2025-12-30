"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createCampaign } from "@/app/lib/actions/campana";
import Input from "@/app/ui/dashboard/campañas/new-campaign-modal/NewCampaignInput";
import CampaignNameDropdown from "@/app/ui/dashboard/campañas/new-campaign-modal/CampaignNameDropdown";
import { SubmitButton } from "../../SubmitButton";
import { Requirements } from "../[id]/update/UpdateForm";
import RequirementsCard from "../[id]/update/RequirementsCards";
import dayjs from "dayjs";
import { campaignsList } from "@/app/lib/data/static-data";
import CloseModalButton from "../../CloseModalButton";
import DynamicFieldsConfig from "./DynamicFieldsConfig";
import CustomAntdDatePicker from "../../Datepicker";
// import CriteriaConfig from "./CriteriaConfig";

export type FormState = {
  success?: boolean;
  message?: string;
};

// Definición de tipos para los campos dinámicos
export type DynamicField = {
  id: number;
  label: string;
  nombre: string; // slug interno (ej: cantidad_paquetes)
  tipo: "text" | "number" | "select" | "boolean";
  opciones: string; // string separado por comas para editar
  requerido: boolean;
  isCustomLabel?: boolean;
};

// export type Criteria =
//   | {
//       id: number;
//       name: "edad_maxima";
//       value: "Edad Máxima";
//       type: number;
//       action: "BLOQUEAR" | "ADVERTIR";
//     }
//   | {
//       id: number;
//       name: "edad_minima";
//       value: "Edad Mínima";
//       type: number;
//       action: "BLOQUEAR" | "ADVERTIR";
//     }
//   | {
//       id: number;
//       name: "tramo_maximo";
//       value: "Tramo Máximo";
//       type: number;
//       action: "BLOQUEAR" | "ADVERTIR";
//     };

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

  // const [criteriaConfig, setCriteriaConfig] = useState<Criteria[]>([
  //   {
  //     id: Date.now(),
  //     name: "tramo_maximo",
  //     value: "Tramo Máximo",
  //     type: 40,
  //     action: "ADVERTIR",
  //   },
  // ]);

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
          label: "Código",
          nombre: "codigo_entrega",
          tipo: "text",
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
          label: "Código",
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
          <CampaignNameDropdown
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
            required
          />

          {/* SECCIÓN 2: CONSTRUCTOR DE FORMULARIO (Reemplaza DataTypeCards) */}
          <DynamicFieldsConfig
            dynamicFields={dynamicFields}
            setDynamicFields={setDynamicFields}
          />

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
          {/* <CriteriaConfig
            criteriaConfig={criteriaConfig}
            setCriteriaConfig={setCriteriaConfig}
          /> */}

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
