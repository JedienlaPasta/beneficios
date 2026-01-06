"use client";
import { createEntrega } from "@/app/lib/actions/entregas";
import { getReceiverByRut } from "@/app/lib/actions/rsh";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Input from "../../campañas/new-campaign-modal/NewCampaignInput";
import { SubmitButton } from "../../SubmitButton";
import { capitalize, capitalizeAll } from "@/app/lib/utils/format";
import ComboboxInput from "./ComboboxInput";

import { HiOutlineRefresh } from "react-icons/hi";
import {
  DynamicFieldSchema,
  FormValue,
  NewModalFormProps,
} from "./NewModalForm";
import CampaignsSelectionList from "./CampaignsSelectionList";

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

      {/* Listado de Campañas (Dinámico) // Beneficios seleccionados */}
      <CampaignsSelectionList
        selectedCampaigns={selectedCampaigns}
        activeCampaigns={activeCampaigns}
        setSelectedCampaigns={setSelectedCampaigns}
      />

      <div className="flex grow flex-col gap-1">
        <label className="ml-1 text-[10px] font-bold uppercase text-slate-500">
          Justificación
          <span className="text-[10px] font-normal text-slate-400">
            {" "}
            (opcional)
          </span>
        </label>
        <textarea
          name="observaciones"
          id="observaciones"
          rows={3}
          maxLength={400}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Se realiza esta entrega a causa de..."
          className="min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm outline-none transition-all placeholder:text-[13px] placeholder:text-slate-400 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
        ></textarea>
        <div className="mt-0.5 flex justify-end">
          <span className="text-xs text-slate-500">
            {observaciones.length}/400 caracteres
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
