"use client";
import { toast } from "sonner";
import CampaignDropdown from "../campañas/campaign-dropdown";
import Input from "../campañas/new-campaign-input";
import { SubmitButton } from "../submit-button";
import { useState, useEffect } from "react";
import { Campaign, RSH } from "@/app/lib/definitions";
import { createEntrega } from "@/app/lib/actions/entregas";
import { useSearchParams, useRouter } from "next/navigation";

type NewModalFormProps = {
  activeCampaigns?: Campaign[];
  data: RSH[];
};

export type FormField = {
  id: string;
  campaignName: string;
  detail: string;
  code: string;
};

export default function NewModalForm({
  activeCampaigns,
  data,
}: NewModalFormProps) {
  const rut = data[0].rut;
  const router = useRouter();
  const [id_usuario, setIdUsuario] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([
    { id: "", campaignName: "", detail: "", code: "" },
  ]);

  useEffect(() => {
    try {
      const userSession = localStorage.getItem("userSession");
      if (userSession) {
        const userData = JSON.parse(userSession);
        setIdUsuario(userData.id_usuario);
      } else {
        toast.error("No se encontró sesión de usuario");
      }
    } catch (error) {
      console.error("Error getting user session:", error);
      toast.error("Error al obtener la sesión de usuario");
    }
  }, []);

  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("newsocialaid", "open");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const dropdownCampaigns = activeCampaigns?.map((campaign) => ({
    id: campaign.id,
    name: campaign.nombre_campaña,
    type: campaign.tipo_dato,
    code: campaign.code,
  }));

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const createEntregaWithId = createEntrega.bind(null, id_usuario);

  const formAction = async (formData: FormData) => {
    // e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    if (formFields[0].campaignName === "") {
      toast.error("Debe seleccionar al menos una campaña");
      return;
    }
    formFields.forEach((item) => {
      if (item.campaignName === "" || item.detail === "") {
        toast.error("Los campos 'Campaña' y 'Detalle' son obligatorios");
        return;
      }
    });

    formData.append("campaigns", JSON.stringify(formFields));
    formData.append("rut", rut.toString());
    formData.append("observaciones", observaciones);

    toast.promise(
      createEntregaWithId(formData).then((response) => {
        if (!response.success) {
          throw new Error(response.message);
        }
        setIsLoading(false);
        setIsDisabled(false);
        return response;
      }),
      {
        loading: "Guardando...",
        success: (response) => {
          setIsLoading(false);
          setTimeout(() => {
            closeModal();
          }, 500);
          return response.message;
        },
        error: (err) => {
          setIsDisabled(false);
          return err.message;
        },
      },
    );
  };

  const handleFieldChange = (
    index: number,
    field: keyof FormField,
    value: string,
  ) => {
    const newFormFields = [...formFields];
    newFormFields[index][field] = value;
    setFormFields(newFormFields);
  };

  const addFormField = () => {
    setFormFields([
      ...formFields,
      { id: "", campaignName: "", detail: "", code: "" },
    ]);
  };
  const removeFormField = () => {
    setFormFields(formFields.filter((_, i) => i !== formFields.length - 1));
  };

  return (
    <form action={formAction} className="flex flex-col gap-5 pt-2">
      {formFields.map((field, index) => (
        <div key={index} className="flex gap-3">
          <CampaignDropdown
            label="Campaña"
            name="campaignName"
            campaignsList={dropdownCampaigns}
            campaignName={field.campaignName}
            readOnly
            setCampaignName={(field, value) =>
              handleFieldChange(index, field, value)
            }
          />
          <div className="grow">
            <Input
              placeHolder="Código, Talla, Monto..."
              label="Detalle"
              type="text"
              nombre={`descripcion-${index}`}
              value={field.detail}
              setData={(value) => handleFieldChange(index, "detail", value)}
            />
          </div>
        </div>
      ))}
      <Input
        placeHolder="Observaciones..."
        label="Observaciones"
        type="text"
        nombre="observaciones"
        value={observaciones}
        setData={setObservaciones}
      />
      <div className="mt-4 flex gap-4">
        <FormFieldButton action={addFormField}>Agregar Campaña</FormFieldButton>
        <FormFieldButton action={removeFormField}>
          Eliminar Campaña
        </FormFieldButton>
      </div>
      <SubmitButton isDisabled={isDisabled} setIsDisabled={setIsDisabled}>
        {isLoading ? "Guardando..." : "Guardar"}
      </SubmitButton>
    </form>
  );
}

function FormFieldButton({
  action,
  children,
}: {
  action: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={action}
      className="h-10 flex-1 grow rounded-lg border border-slate-300 bg-blue-500 px-4 text-sm text-white transition-colors hover:bg-blue-600"
    >
      {children}
    </button>
  );
}
