"use client";
import { createEntrega } from "@/app/lib/actions/entregas";
import { Campaign, EntregasTable } from "@/app/lib/definitions";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Input from "../campañas/new-campaign-input";
import { SubmitButton } from "../submit-button";
import CustomAntdDatePicker from "../datepicker";
import dayjs from "dayjs";
import UserDropdown from "./user-dropdown";

const usersList = [
  {
    id: "1",
    name: "Jenifer Rojas",
    email: "tsdepartamentosocial@elquisco.cl",
  },
  {
    id: "2",
    name: "Karina Hormazabal",
    email: "karinat.s.d.q@gmail.com",
  },
];

type NewModalFormProps = {
  activeCampaigns?: Campaign[];
  rut: string;
  userId: string;
  entregas: EntregasTable[];
};

export default function NewModalFormManual({
  activeCampaigns,
  rut,
  userId,
  entregas,
}: NewModalFormProps) {
  const router = useRouter();
  const [folio, setFolio] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [lastSelection, setLastSelection] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState<Date | null>(null);
  const [correo, setCorreo] = useState("");

  // Initialize selectedCampaigns with a lazy initializer function
  const [selectedCampaigns, setSelectedCampaigns] = useState<{
    [campaignId: string]: { selected: boolean; detail: string };
  }>(() => {
    if (activeCampaigns && activeCampaigns.length > 0) {
      return activeCampaigns.reduce(
        (acc, campaign) => {
          acc[campaign.id] = { selected: false, detail: "" };
          return acc;
        },
        {} as { [key: string]: { selected: boolean; detail: string } },
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

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Update this line to use the userId prop directly
  const createEntregaWithId = createEntrega.bind(null, userId);

  const checkValues = (campaign: Campaign) => {
    if (campaign.stock === null) return;
    if (campaign.entregas === null) return;
    if (campaign.stock - campaign.entregas < 1) return true;
    return false;
  };

  const getStock = (campaign: Campaign) => {
    if (campaign.stock === null) return 0;
    if (campaign.entregas === null) return 0;
    return campaign.stock - campaign.entregas;
  };

  const handleCheckboxChange = (campaign: Campaign) => {
    const campaignId = campaign.id;
    setLastSelection(campaignId);

    if (!checkValues(campaign)) {
      setSelectedCampaigns((prev) => ({
        ...prev,
        [campaignId]: {
          ...prev[campaignId],
          selected: !prev[campaignId].selected,
        },
      }));
    }
  };

  const handleDetailChange = (campaignId: string, value: string) => {
    setSelectedCampaigns((prev) => ({
      ...prev,
      [campaignId]: {
        ...prev[campaignId],
        detail: value,
      },
    }));
  };

  const formAction = async (formData: FormData) => {
    if (entregas && entregas.length > 0) {
      const hasMatchingDate = entregas.some((entrega) =>
        dayjs(entrega.fecha_entrega).isSame(dayjs(fechaEntrega), "day"),
      );

      if (hasMatchingDate) {
        toast.error(
          `Ya recibió un beneficio el día [${dayjs(fechaEntrega).format("DD-MM-YYYY")}], solo se puede ingresar 1 beneficio por día.`,
        );
        return;
      }
    }

    setIsLoading(true);
    setIsDisabled(true);

    // Convert selectedCampaigns to formFields format
    const campaignsToSubmit = Object.entries(selectedCampaigns)
      .filter(
        ([, value]: [string, { selected: boolean; detail: string }]) =>
          value.selected,
      )
      .map(([id, value]) => {
        const campaign = activeCampaigns?.find(
          (campaign) => campaign.id === id,
        );
        return {
          id,
          campaignName: campaign?.nombre_campaña || "",
          detail: value.detail,
          code: campaign?.code || "",
        };
      });

    if (campaignsToSubmit.length === 0) {
      toast.error("Debe seleccionar al menos una campaña");
      setIsLoading(false);
      setIsDisabled(false);
      return;
    }

    for (const campaign of campaignsToSubmit) {
      if (campaign.detail.toString().trim() === "") {
        toast.error(
          `Debe ingresar un detalle para la campaña "${campaign.campaignName}"`,
        );
        setIsLoading(false);
        setIsDisabled(false);
        return;
      }
    }

    formData.append("campaigns", JSON.stringify(campaignsToSubmit));
    formData.append("rut", rut.toString());
    formData.append("observaciones", observaciones);
    formData.append("fecha_entrega", fechaEntrega?.toISOString() || "");
    formData.append("folio", folio.toString().toUpperCase());
    formData.append("correo", correo);

    const toastId = toast.loading("Guardando...");
    try {
      const response = await createEntregaWithId(formData);
      if (!response.success) {
        throw new Error(response.message);
      }
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

  const fechaEntregaHandler = (pickerDate: dayjs.Dayjs | null) => {
    if (pickerDate) {
      setFechaEntrega(pickerDate.toDate());
    } else {
      setFechaEntrega(null);
    }
  };

  // Add this function to check if form is valid
  const isFormValid = () => {
    // Check if any campaigns are selected
    const selectedCount = Object.values(selectedCampaigns).filter(
      (v) => v.selected,
    ).length;

    if (selectedCount === 0) return false;

    if (!fechaEntrega) return false;

    if (folio.trim() === "" || folio.trim().length < 7) return false;

    if (correo.trim() === "") return false;

    // Check if all selected campaigns have details
    const hasEmptyDetails = Object.entries(selectedCampaigns)
      .filter(
        ([, value]: [string, { selected: boolean; detail: string }]) =>
          value.selected,
      )
      .some(
        ([, value]: [string, { selected: boolean; detail: string }]) =>
          value.detail.trim() === "",
      );

    return !hasEmptyDetails;
  };

  return (
    <form action={formAction} className="flex select-none flex-col gap-5 pt-2">
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeHolder="Folio..."
          label="Folio"
          type="text"
          nombre="folio"
          value={folio}
          setData={setFolio}
          required
        />

        <CustomAntdDatePicker
          label="Fecha de Entrega"
          placeholder="Seleccione una fecha"
          setDate={fechaEntregaHandler}
          required
        />
      </div>

      <UserDropdown
        placeHolder="tu@correo.com..."
        label="Correo"
        name="correo"
        userEmail={correo}
        setUserEmail={setCorreo}
        usersList={usersList}
      />

      <div className="max-h-[400px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 scrollbar-hide">
        <div className="justify- mb-4 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-slate-700">
            Beneficios seleccionados:
          </h3>
          <div className="text-xs text-slate-500">
            {Object.values(selectedCampaigns).filter((v) => v.selected).length}{" "}
            seleccionadas
          </div>
        </div>

        <div className="space-y-3">
          {activeCampaigns?.map((campaign) => (
            <div
              key={campaign.id}
              className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:border-slate-300 ${
                selectedCampaigns[campaign.id]?.selected
                  ? "!border-blue-300 ring-blue-300"
                  : lastSelection === campaign.id && checkValues(campaign)
                    ? "!border-rose-300"
                    : "!border-slate-200"
              }`}
            >
              <div
                className="flex cursor-pointer items-start gap-3 p-3"
                onClick={() => handleCheckboxChange(campaign)}
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    selectedCampaigns[campaign.id]?.selected
                      ? "border-blue-500 bg-blue-500"
                      : lastSelection === campaign.id && checkValues(campaign)
                        ? "!border-rose-300"
                        : "!border-slate-200"
                  }`}
                >
                  {selectedCampaigns[campaign.id]?.selected && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3.5 w-3.5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`campaign-${campaign.id}`}
                      className={`cursor-pointer text-sm font-medium ${
                        lastSelection === campaign.id && checkValues(campaign)
                          ? "text-rose-500"
                          : "text-slate-700"
                      }`}
                    >
                      {campaign.nombre_campaña}
                    </label>
                    <span
                      className={`rounded-full bg-slate-100 px-2 py-0.5 text-xs ${
                        lastSelection === campaign.id && checkValues(campaign)
                          ? "text-rose-500"
                          : "text-slate-600"
                      }`}
                    >
                      Stock: {getStock(campaign)}
                    </span>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {selectedCampaigns[campaign.id]?.selected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                      opacity: { duration: 0.2 },
                    }}
                    className="overflow-hidden"
                    onAnimationStart={() => {
                      // Force scrollbar recalculation during animation
                      const container = document.querySelector(
                        ".scrollbar-gutter-stable",
                      );
                      if (container) container.scrollTop = container.scrollTop;
                    }}
                  >
                    <div className="border-t border-slate-100 bg-slate-50 p-3">
                      <Input
                        placeHolder={`Ingrese ${campaign.tipo_dato.toLowerCase()}...`}
                        type="text"
                        nombre={`detail-${campaign.id}`}
                        value={selectedCampaigns[campaign.id]?.detail || ""}
                        setData={(value) =>
                          handleDetailChange(campaign.id, value)
                        }
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {(!activeCampaigns || activeCampaigns.length === 0) && (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              No hay campañas activas disponibles
            </div>
          )}
        </div>
      </div>

      <Input
        placeHolder="Observaciones..."
        label="Observaciones"
        type="text"
        nombre="observaciones"
        value={observaciones}
        setData={setObservaciones}
      />

      <div className="mt-2 flex">
        <SubmitButton isDisabled={isDisabled || !isFormValid()}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </div>
    </form>
  );
}
