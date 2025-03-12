"use client";
import Input from "../../new-campaign-input";
import RequirementsCard from "./requirements-cards";
import { CancelButton, SubmitButton } from "../../../submit-button";
import { Campaign } from "@/app/lib/definitions";
import { useState } from "react";
import DataTypeCards from "./data-type-cards";
import { updateCampaign } from "@/app/lib/actions/campaña";
import { useRouter } from "next/navigation";
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

  const formAction = async (formData: FormData) => {
    formData.append("nombre", updateFormData.nombre);
    formData.append("fechaInicio", updateFormData.fecha_inicio.toString());
    formData.append("fechaTermino", updateFormData.fecha_termino.toString());
    formData.append("tipoDato", fieldType);
    formData.append("tramo", criteria.tramo.toString());
    formData.append("discapacidad", criteria.discapacidad.toString());
    formData.append("adultoMayor", criteria.adultoMayor.toString());
    const response = await updateCampaignWithId(formData);
    // console.log(response);
    if (response.success) {
      toast.success(response.message);
      setIsLoading(false);
      setTimeout(() => {
        router.back();
      }, 1500);
    } else {
      toast.error(response.message);
      setIsLoading(false);
      setIsDisabled(false);
    }
  };

  // To handle server response
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    setIsLoading(true);
    setIsDisabled(true);
    toast.info("Guardando...");
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="mt-2 grid w-full gap-5 bg-white"
    >
      <Input
        label="Nombre"
        nombre="nombre"
        value={updateFormData.nombre}
        setFormData={setUpdateFormData}
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
