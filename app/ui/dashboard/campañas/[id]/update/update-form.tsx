"use client";
import Input from "../../new-campaign-input";
import RequirementsCard from "./requirements-cards";
import { CancelButton, SubmitButton } from "../../../submit-button";
import { Campaign } from "@/app/lib/definitions";
import { useState } from "react";
import DataTypeCards from "./data-type-cards";
import { updateCampaign } from "@/app/lib/actions/campaña";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import CustomAntdDatePicker from "@/app/ui/dashboard/datepicker";
import dayjs from "dayjs";

export type Requirements = {
  tramo: boolean;
  discapacidad: boolean;
  adultoMayor: boolean;
};

export default function UpdateForm({ data }: { data: Campaign[] }) {
  const [fieldType, setFieldType] = useState(data[0].tipo_dato);
  const [updateFormData, setUpdateFormData] = useState<Campaign>(data[0]);
  const [criteria, setCriteria] = useState<Requirements>({
    tramo: Boolean(data[0].tramo),
    discapacidad: Boolean(data[0].discapacidad),
    adultoMayor: Boolean(data[0].adulto_mayor),
  });
  const updateCampaignWithId = updateCampaign.bind(null, updateFormData.id);

  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("update", "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const formAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();

    myFormData.append("nombre", updateFormData.nombre_campaña);
    myFormData.append("fechaInicio", updateFormData.fecha_inicio.toString());
    myFormData.append("fechaTermino", updateFormData.fecha_termino.toString());
    myFormData.append("tipoDato", fieldType);
    myFormData.append("tramo", criteria.tramo.toString());
    myFormData.append("discapacidad", criteria.discapacidad.toString());
    myFormData.append("adultoMayor", criteria.adultoMayor.toString());

    const toastId = toast.loading("Guardando...");
    try {
      const response = await updateCampaignWithId(myFormData);
      if (!response.success) {
        throw new Error(response.message);
      }

      toast.success(response.message, { id: toastId });
      setIsLoading(false);
      setTimeout(closeModal, 500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(message, { id: toastId });
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  return (
    <form onSubmit={formAction} className="mt-2 grid w-full gap-5 bg-white">
      <Input
        label="Nombre"
        nombre="nombre_campaña"
        value={updateFormData.nombre_campaña}
        setFormData={setUpdateFormData}
        required
        type="text"
      />
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
        label="Inicio"
        placeholder="Ingrese fecha de inicio"
        defaultValue={dayjs(updateFormData.fecha_inicio)}
        setFormData={setUpdateFormData}
      />
      <CustomAntdDatePicker
        label="Término"
        placeholder="Ingrese fecha de término"
        defaultValue={dayjs(updateFormData.fecha_termino)}
        setFormData={setUpdateFormData}
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
      <div className="grid grid-cols-2 gap-3">
        <CancelButton
          name="update"
          isDisabled={isDisabled}
          setIsDisabled={setIsDisabled}
        ></CancelButton>
        <SubmitButton isDisabled={isDisabled} setIsDisabled={setIsDisabled}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </div>
    </form>
  );
}
