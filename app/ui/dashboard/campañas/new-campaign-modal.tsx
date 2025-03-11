"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCampaign } from "@/app/lib/actions";
import Input from "@/app/ui/dashboard/campañas/new-campaign-input";
import CampaignDropdown from "@/app/ui/dashboard/campañas/campaign-dropdown";
import { RiCloseLine } from "react-icons/ri";
import { SubmitButton } from "../submit-button";
import { Requirements } from "./[id]/update/update-form";
import DataTypeCards from "./[id]/update/data-type-cards";
import RequirementsCard from "./[id]/update/requirements-cards";
import dayjs from "dayjs";
import CustomAntdDatePicker from "@/app/ui/dashboard/datepicker";

export type FormState = {
  success?: boolean;
  message?: string;
};

export default function NewCampaignModal() {
  const router = useRouter();
  const [date, setDate] = useState<Date | null>(null);
  const [codigo, setCodigo] = useState("");
  const [fieldType, setFieldType] = useState("Código");
  const [criteria, setCriteria] = useState<Requirements>({
    tramo: Boolean(false),
    discapacidad: Boolean(false),
    adultoMayor: Boolean(false),
  });
  const [state, formAction] = useActionState<FormState, FormData>(
    createCampaign,
    {
      success: false,
      message: "",
    },
  );

  const datePickerHandler = (pickerDate: dayjs.Dayjs | null) => {
    if (pickerDate) {
      const dt = pickerDate.toDate();
      setDate(dt);
    } else {
      setDate(null);
    }
  };

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        setIsLoading(false);
        setTimeout(() => {
          router.back();
        }, 1500);
      } else {
        toast.error(state.message);
        setIsLoading(false);
        setIsDisabled(false);
      }
    }
  }, [state, router]);

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    setIsLoading(true);
    setIsDisabled(true);
    toast.info("Guardando...");

    formData.append("fechaTermino", date?.toString() || "");
    formData.append("descripcion", codigo?.toString() || "");
    formData.append("tipoDato", fieldType);
    formData.append("tramo", criteria.tramo.toString());
    formData.append("discapacidad", criteria.discapacidad.toString());
    formData.append("adultoMayor", criteria.adultoMayor.toString());
    formAction(formData);
    // await formAction(formData);
  };

  return (
    <div className="grid max-h-dvh max-w-[30rem] shrink-0 flex-col gap-3 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Crear Campaña</h2>
        <RiCloseLine
          className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          onClick={() => router.back()}
        />
      </div>
      <p className="text-xs text-gray-500">
        Elige el tipo de campaña que quieres ingresar y sus datos
        correspondientes.
      </p>
      <form action={handleFormAction} className="flex flex-col gap-5 pt-2">
        <CampaignDropdown label="Campaña" name={"nombre"} />
        <div className="flex items-end gap-3">
          <div className="grow">
            <Input
              placeHolder="Código..."
              label="Código Campaña"
              type="text"
              nombre="descripcion"
              value={codigo}
              setData={setCodigo}
            />
          </div>
          <CampaignCode descripcion={codigo ? codigo.toUpperCase() : "##"} />
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
        <SubmitButton isDisabled={isDisabled} setIsDisabled={setIsDisabled}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </form>
    </div>
  );
}

function CampaignCode({ descripcion }: { descripcion: string }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
      {descripcion}
    </span>
  );
}
