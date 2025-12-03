"use client";
import { createEntrega } from "@/app/lib/actions/entregas";
import { Campaign } from "@/app/lib/definitions";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import Input from "../../campañas/new-campaign-input";
import { SubmitButton } from "../../submit-button";

type NewModalFormProps = {
  activeCampaigns?: Campaign[];
  rut: string;
  userId: string;
};

export default function NewModalFormReceiver({
  activeCampaigns,
  rut,
  userId,
}: NewModalFormProps) {
  const router = useRouter();
  const [rutReceiver, setRutReceiver] = useState("");
  const [nombresReceiver, setNombresReceiver] = useState("");
  const [apellidosReceiver, setApellidosReceiver] = useState("");
  const [direccionReceiver, setDireccionReceiver] = useState("");
  const [telefonoReceiver, setTelefonoReceiver] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [lastSelection, setLastSelection] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize selectedCampaigns with a lazy initializer function
  const [selectedCampaigns, setSelectedCampaigns] = useState<{
    [campaignId: string]: { selected: boolean; detail: string };
  }>(() => {
    if (activeCampaigns && activeCampaigns.length > 0) {
      return activeCampaigns.reduce(
        (acc, campaign) => {
          const defaultValue =
            campaign.nombre_campaña === "Tarjeta de Comida" ? "NN" : "";
          acc[campaign.id] = { selected: false, detail: defaultValue };
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
    formData.append("rut_receptor", rutReceiver.toString().toUpperCase());
    formData.append("nombres_receptor", nombresReceiver.toString());
    formData.append("apellidos_receptor", apellidosReceiver.toString());
    formData.append("direccion_receptor", direccionReceiver.toString());

    const toastId = toast.loading("Guardando...");
    setTimeout(async () => {
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
    }, 200);
  };

  // Formateo de RUT en vivo
  const formatRutLive = (input: string) => {
    const cleaned = input.replace(/[^0-9kK]/g, "").toUpperCase();
    if (!cleaned) return { display: "", rutDigits: "", dv: "" };

    const maybeDv = cleaned.slice(-1);
    const hasDv = cleaned.length > 1 && /[0-9K]/.test(maybeDv);
    const rutDigits = hasDv ? cleaned.slice(0, -1) : cleaned;

    const withDots = rutDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const display = hasDv ? `${withDots}-${maybeDv}` : withDots;

    return { display, rutDigits };
  };

  const countRutDigits = (formatted: string) =>
    formatted.replace(/[^0-9]/g, "").length;

  // Add this function to check if form is valid
  const isFormValid = () => {
    // Check if any campaigns are selected
    const selectedCount = Object.values(selectedCampaigns).filter(
      (v) => v.selected,
    ).length;

    if (selectedCount === 0) return false;

    // Validar cantidad de dígitos del RUT (sin contar puntos/guion)
    if (countRutDigits(rutReceiver) < 7) return false;

    if (nombresReceiver.trim() === "") return false;
    if (apellidosReceiver.trim() === "") return false;
    if (direccionReceiver.trim() === "") return false;

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
    <form
      action={formAction}
      className="flex select-none flex-col justify-center gap-3 px-0.5 pt-2"
    >
      <h4 className="text-sm font-medium text-slate-700">Datos del receptor</h4>
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeHolder="12345678..."
          label="RUT *"
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
          label="Teléfono *"
          type="text"
          nombre="telefono_receiver"
          value={telefonoReceiver}
          setData={setTelefonoReceiver}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeHolder="Juan Martínez..."
          label="Nombres *"
          type="text"
          nombre="nombres_receiver"
          value={nombresReceiver}
          setData={setNombresReceiver}
          required
        />
        <Input
          placeHolder="Gonzalez Figueroa..."
          label="Apellidos *"
          type="text"
          nombre="apellidos_receiver"
          value={apellidosReceiver}
          setData={setApellidosReceiver}
          required
        />
      </div>

      <Input
        placeHolder="Dirección completa..."
        label="Dirección *"
        type="text"
        nombre="direccion_receiver"
        value={direccionReceiver}
        setData={setDireccionReceiver}
        required
      />

      <div
        ref={scrollRef}
        className="scrollbar-gutter-stable mt-2 max-h-[420px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4"
      >
        <div className="sticky top-0 z-10 mb-3 flex items-baseline justify-between border-b border-slate-200 bg-slate-50 pb-2">
          <h3 className="text-sm font-medium text-slate-700">
            Beneficios seleccionados
          </h3>
          <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            {Object.values(selectedCampaigns).filter((v) => v.selected).length}{" "}
            seleccionadas
          </div>
        </div>

        <div className="space-y-3">
          {activeCampaigns?.map((campaign) => {
            const isSelected = !!selectedCampaigns[campaign.id]?.selected;
            const isOutOfStock = !!checkValues(campaign);

            return (
              <div
                key={campaign.id}
                className={`overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:border-slate-300 ${
                  isSelected
                    ? "sring-2 !border-blue-300 ring-blue-200"
                    : isOutOfStock
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
                      isSelected
                        ? "border-blue-500 bg-blue-500"
                        : isOutOfStock
                          ? "!border-rose-300"
                          : "!border-slate-200"
                    }`}
                  >
                    {isSelected && (
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
                          isOutOfStock ? "text-rose-400" : "text-slate-700"
                        }`}
                      >
                        {campaign.nombre_campaña}
                      </label>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${
                          isOutOfStock
                            ? "border-rose-300 bg-rose-50 text-rose-500"
                            : "border-gray-200 bg-gray-50 text-gray-600"
                        }`}
                      >
                        Stock: {getStock(campaign)}
                      </span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
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
                        // Force scrollbar recalculation durante la animación
                        const container = scrollRef.current;
                        if (container)
                          container.scrollTop = container.scrollTop;
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
            );
          })}

          {(!activeCampaigns || activeCampaigns.length === 0) && (
            <div className="flex h-24 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              No hay campañas activas disponibles
            </div>
          )}
        </div>
      </div>

      <div className="flex grow flex-col gap-1">
        <label htmlFor={observaciones} className="text-xs text-slate-500">
          Justificación
        </label>
        <textarea
          name="observaciones"
          id="observaciones"
          rows={4}
          maxLength={390}
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          placeholder="Justificación..."
          className="min-h-[120px] w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500"
        ></textarea>
      </div>

      <div className="mt-3 flex">
        <SubmitButton isDisabled={isDisabled || !isFormValid()}>
          {isLoading ? "Guardando..." : "Guardar"}
        </SubmitButton>
      </div>
    </form>
  );
}
