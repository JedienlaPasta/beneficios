"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createCampaign } from "@/app/lib/actions/campaña";
import Input from "@/app/ui/dashboard/campañas/new-campaign-input";
import CampaignDropdown from "@/app/ui/dashboard/campañas/campaign-dropdown";
import { RiCloseLine } from "react-icons/ri";
import { SubmitButton } from "../submit-button";
import { Requirements } from "./[id]/update/update-form";
import DataTypeCards from "./[id]/update/data-type-cards";
import RequirementsCard from "./[id]/update/requirements-cards";
import dayjs from "dayjs";
import CustomAntdDatePicker from "@/app/ui/dashboard/datepicker";
import { campaignsList } from "@/app/lib/data/static-data";

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
  const [fieldType, setFieldType] = useState("Código");
  const [criteria, setCriteria] = useState<Requirements>({
    tramo: Boolean(false),
    discapacidad: Boolean(false),
    adultoMayor: Boolean(false),
  });

  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("modal", "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleCampaignNameSelection = (value: string) => {
    setCampaignName(value);
    if (value === "Tarjeta de Comida") {
      setCode("TA");
      setFieldType("Código");
    } else if (value === "Vale de Gas") {
      setCode("GA");
      setFieldType("Código");
    } else if (value === "Pañales") {
      setCode("PA");
      setFieldType("Talla");
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

  const formAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();
    myFormData.append("nombre", campaignName);
    myFormData.append("fechaTermino", date?.toString() || "");
    myFormData.append("code", code.toString() || "");
    myFormData.append("stock", stock.toString() || (0).toString());
    myFormData.append("tipoDato", fieldType);
    myFormData.append("tramo", criteria.tramo.toString());
    myFormData.append("discapacidad", criteria.discapacidad.toString());
    myFormData.append("adultoMayor", criteria.adultoMayor.toString());

    toast.promise(
      createCampaign(myFormData).then((response) => {
        if (!response.success) {
          throw new Error(response.message);
        }
        return response;
      }),
      {
        loading: "Guardando...",
        success: (response) => {
          setIsLoading(false);
          // setTimeout(() => {
          //   closeModal();
          // }, 1000);
          closeModal();
          return response.message;
        },
        error: (err) => {
          setIsDisabled(false);
          setIsLoading(false);
          return err.message;
        },
      },
    );
  };

  return (
    <div className="grid max-h-dvh w-full max-w-[30rem] shrink-0 flex-col gap-3 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Crear Campaña</h2>
        <RiCloseLine
          className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          onClick={closeModal}
        />
      </div>
      <p className="text-xs text-gray-500">
        Elige el tipo de campaña que quieres ingresar y sus datos
        correspondientes.
      </p>
      <form onSubmit={formAction} className="flex flex-col gap-5 pt-2">
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
              required={true}
              htmlId={true}
              placeHolder="Stock..."
              label="Stock Inicial"
              type="text"
              nombre="stock"
              value={stock}
              setData={setStock}
            />
          </div>
          <div className="grow">
            <Input
              required={true}
              htmlId={true}
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
          <div className="grid grid-cols-3 gap-3">
            <DataTypeCards value={fieldType} setValue={setFieldType}>
              Código
            </DataTypeCards>
            <DataTypeCards value={fieldType} setValue={setFieldType}>
              Monto
            </DataTypeCards>
            <DataTypeCards value={fieldType} setValue={setFieldType}>
              Talla
            </DataTypeCards>
          </div>
        </div>
        <CustomAntdDatePicker
          label="Término"
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
        <SubmitButton isDisabled={isDisabled}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </form>
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
