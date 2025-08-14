"use client";
import { AnimatePresence, motion } from "framer-motion";
import Input from "../campañas/new-campaign-input";
import { SubmitButton } from "../submit-button";
import { toast } from "sonner";
import { updateRSH } from "@/app/lib/actions/rsh";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RSH } from "@/app/lib/definitions";
import CloseModalButton from "../close-modal-button";
import { formatRUT } from "@/app/lib/utils/format";

type ModalProps = {
  name: string;
  citizen: RSH;
};

export default function EditCitizenContactInfoModal({
  name,
  citizen,
}: ModalProps) {
  const { rut, folio } = citizen;

  return (
    <motion.div
      layout
      layoutRoot
      transition={{ layout: { duration: 0.25 } }}
      className="flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-white p-8 shadow-xl"
    >
      {/* Header */}
      <section className="flex flex-shrink-0 items-center justify-between">
        {" "}
        <div className="flex flex-col items-start justify-between">
          <span className="text-xs font-medium text-slate-500">Folio</span>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-700">#{folio}</h2>
          </div>
          <span className="flex gap-1 text-xs text-slate-500">
            RUT: <p className="text-blue-700">{rut ? formatRUT(rut) : ""}</p>
          </span>
        </div>
        <CloseModalButton name={name} />
      </section>

      {/* Tab Navigation */}
      <section className="relative flex items-center justify-between border-b border-gray-200">
        {" "}
        <AnimatePresence mode="wait">
          <motion.span
            key="edit-tab-buttons"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{
              duration: 0.3,
            }}
          >
            <button
              className={`relative px-4 py-2 text-sm font-medium text-blue-600 outline-none transition-colors`}
            >
              {"Contacto"}
              <motion.span
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600"
                transition={{ duration: 0.2 }}
              />
            </button>
          </motion.span>
        </AnimatePresence>
      </section>

      <div className="flex justify-between">
        <h3 className="flex items-center gap-3 py-2 text-sm font-medium text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
          Información de Contacto
        </h3>
      </div>

      <section className="overflow-y-auto scrollbar-hide">
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key="update-form"
            initial={{ opacity: 0, y: 10, height: 340 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 220 }}
            transition={{ duration: 0.4 }}
          >
            <UpdateForm name={name} citizen={citizen} />
          </motion.div>
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

type UpdateFormProps = {
  name: string;
  citizen: RSH;
};

function UpdateForm({ name, citizen }: UpdateFormProps) {
  const [direccion, setDireccion] = useState(
    citizen?.direccion_mod || citizen?.direccion || "",
  );
  const [sector, setSector] = useState(
    citizen?.sector_mod || citizen?.sector || "",
  );
  const [telefono, setTelefono] = useState(
    String(citizen?.telefono_mod || citizen?.telefono || ""),
  );
  const [correo, setCorreo] = useState(
    citizen?.correo_mod || citizen?.correo || "",
  );

  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete(name);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Button handlers
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();

    myFormData.append("rut", String(citizen.rut));
    myFormData.append("direccion", direccion);
    myFormData.append("sector", sector);
    myFormData.append("telefono", telefono);
    myFormData.append("correo", correo);

    const toastId = toast.loading("Guardando...");
    try {
      const response = await updateRSH(myFormData);
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message, { id: toastId });
      closeModal();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al crear el registro";
      toast.error(message, { id: toastId });
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = () => {
    return direccion.trim() !== "";
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-y-auto scrollbar-hide">
      <motion.div className="relative grid min-h-[6rem] gap-6">
        <AnimatePresence mode="wait">
          <motion.section
            key="opcional"
            initial={{ opacity: 0, y: 10, height: 290 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 270 }}
            transition={{
              duration: 0.4,
              height: { duration: 0.4 },
              ease: "easeInOut",
            }}
            layout
          >
            <div className="flex flex-col gap-5 pt-2">
              <Input
                placeHolder="Dirección completa"
                label="Dirección *"
                type="text"
                nombre="direccion"
                value={direccion}
                setData={setDireccion}
                required
              />

              <div className="flex grow gap-3">
                <Input
                  placeHolder="Sector"
                  label="Sector"
                  type="text"
                  nombre="sector"
                  value={sector}
                  setData={setSector}
                />
                <Input
                  placeHolder="912345678"
                  label="Teléfono"
                  type="text"
                  pattern="[0-9]*"
                  maxLength={9}
                  nombre="telefono"
                  value={telefono}
                  setData={setTelefono}
                />
              </div>

              <Input
                placeHolder="correo@ejemplo.com"
                label="Correo Electrónico"
                type="email"
                nombre="correo"
                value={correo}
                setData={setCorreo}
              />
            </div>
          </motion.section>
        </AnimatePresence>
        <div className="z-10 flex">
          <SubmitButton isDisabled={isDisabled || !isFormValid()}>
            {isLoading ? "Guardando..." : "Guardar"}
          </SubmitButton>
        </div>
      </motion.div>
    </form>
  );
}
