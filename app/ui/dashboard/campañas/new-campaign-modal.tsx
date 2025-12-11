"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createCampaign } from "@/app/lib/actions/campana";
import Input from "@/app/ui/dashboard/campañas/new-campaign-input";
import CampaignDropdown from "@/app/ui/dashboard/campañas/campaign-dropdown";
import { SubmitButton } from "../submit-button";
import { Requirements } from "./[id]/update/update-form";
import DataTypeCards from "./[id]/update/data-type-cards";
import RequirementsCard from "./[id]/update/requirements-cards";
import dayjs from "dayjs";
import CustomAntdDatePicker from "@/app/ui/dashboard/datepicker";
import { campaignsList } from "@/app/lib/data/static-data";
import CloseModalButton from "../close-modal-button";

export type FormState = {
  success?: boolean;
  message?: string;
};

export default function NewCampaignModal() {
  const router = useRouter();
  const [campaignName, setCampaignName] = useState("");
  const [date, setDate] = useState<Date | null>(null);
  const [stock, setStock] = useState("");
  const [code, setCode] = useState("");
  const [fieldType, setFieldType] = useState<string[]>(["Código"]);
  const [criteria, setCriteria] = useState<Requirements>({
    tramo: Boolean(false),
    discapacidad: Boolean(false),
    adultoMayor: Boolean(false),
  });

  const searchParams = useSearchParams();

  console.log(fieldType);

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("modal", "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleCampaignNameSelection = (value: string) => {
    setCampaignName(value);
    if (value === "Tarjeta de Comida") {
      setCode("TA");
      setFieldType(["Código"]);
    } else if (value === "Vale de Gas") {
      setCode("GA");
      setFieldType(["Código"]);
    } else if (value === "Pañales") {
      setCode("PA");
      setFieldType(["Talla"]);
    }
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
      const date = pickerDate.toDate();
      setDate(date);
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
      // stock.trim() !== "" &&
      code.trim() !== "" &&
      date !== null
    );
  };

  const formAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();
    myFormData.append("nombre", campaignName);
    myFormData.append("fechaTermino", date?.toString() || "");
    myFormData.append("code", code.toString() || "");
    myFormData.append("stock", stock.toString());
    myFormData.append("esquemaFormulario", fieldType.join(","));
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
    <div className="flex max-h-full w-[32rem] max-w-full shrink-0 flex-col overflow-hidden rounded-xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Crear Campaña</h2>
        <CloseModalButton name="modal" />
      </div>
      <p className="text-xs text-gray-500">
        Elige el tipo de campaña que quieres ingresar y sus datos
        correspondientes.
      </p>
      <div className="overflow-y-auto scrollbar-hide">
        <form
          onSubmit={formAction}
          className="mt-2 flex flex-col gap-5 bg-white"
        >
          <CampaignDropdown
            label="Campaña"
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
          <div className="flex flex-col gap-1">
            <p className="text-xs text-slate-500">Dato Asociado</p>
            <div className="grid grid-cols-2 gap-3">
              <DataTypeCards
                type="Texto"
                values={fieldType}
                setValues={setFieldType}
              >
                Código
              </DataTypeCards>
              <DataTypeCards
                type="Número"
                values={fieldType}
                setValues={setFieldType}
              >
                Monto
              </DataTypeCards>
              <DataTypeCards
                type="Texto"
                values={fieldType}
                setValues={setFieldType}
              >
                Talla
              </DataTypeCards>
              <DataTypeCards
                type="Número"
                values={fieldType}
                setValues={setFieldType}
              >
                Cantidad
              </DataTypeCards>
              <DataTypeCards
                type="V/F"
                values={fieldType}
                setValues={setFieldType}
              >
                Adulto
              </DataTypeCards>
              <DataTypeCards
                type="Texto"
                values={fieldType}
                setValues={setFieldType}
              >
                Detalle
              </DataTypeCards>
            </div>
          </div>
          <CustomAntdDatePicker
            label="Término"
            value={date ? dayjs(date) : null}
            placeholder="Seleccione una fecha"
            setDate={datePickerHandler}
          />

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
