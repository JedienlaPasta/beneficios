"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Input from "@/app/ui/dashboard/campañas/new-campaign-input";
import { RiCloseLine } from "react-icons/ri";
import dayjs from "dayjs";
import CustomAntdDatePicker from "@/app/ui/dashboard/datepicker";
import { SubmitButton } from "../submit-button";

export type FormState = {
  success?: boolean;
  message?: string;
};

export default function NewCitizenModal({ name }: { name: string }) {
  const router = useRouter();
  const [date, setDate] = useState<Date | null>(null);
  const [codigo, setCodigo] = useState("");

  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(name, "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const datePickerHandler = (pickerDate: dayjs.Dayjs | null) => {
    if (pickerDate) {
      const dt = pickerDate.toDate();
      setDate(dt);
    } else {
      setDate(null);
    }
  };

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    setIsLoading(true);
    setIsDisabled(true);
    console.log(isDisabled);
    toast.info("Guardando...");

    formData.append("fechaTermino", date?.toString() || "");
    formData.append("descripcion", codigo?.toString() || "");
    // formAction(formData);
  };

  return (
    <div className="grid max-h-dvh max-w-[30rem] shrink-0 flex-col gap-3 overflow-y-auto rounded-xl bg-white p-8 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Ingresar Registro Social de Hogares
        </h2>
        <RiCloseLine
          className="cursor-pointer text-xl text-slate-400 hover:text-slate-600"
          onClick={closeModal}
        />
      </div>
      <p className="text-xs text-gray-500">
        Ingresa los datos necesarios para crear un registro social de hogares.
      </p>
      <form action={handleFormAction} className="flex flex-col gap-5 pt-2">
        <div className="flex grow gap-3">
          <Input
            placeHolder="Código..."
            htmlId={true}
            label="Nombre Ciudadano"
            type="text"
            nombre="descripcion"
            value={codigo}
            setData={setCodigo}
          />
        </div>
        <CustomAntdDatePicker
          label="Fecha"
          placeholder="Seleccione una fecha"
          setDate={datePickerHandler}
        />
        <SubmitButton isDisabled={true} setIsDisabled={setIsDisabled}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </form>
    </div>
  );
}
