"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import CloseModalButton from "../CloseModalButton";
import { SubmitButton } from "../SubmitButton";
import Input from "../campañas/new-campaign-modal/NewCampaignInput";
import { toast } from "sonner";
import { updateRSHName } from "@/app/lib/actions/rsh";

type Props = {
  rut: string;
  nombres_rsh: string;
  apellidos_rsh: string;
};

export default function ChangeNameModal({
  rut,
  nombres_rsh,
  apellidos_rsh,
}: Props) {
  const [nombres, setNombres] = useState<string>(nombres_rsh || "");
  const [apellidos, setApellidos] = useState<string>(apellidos_rsh || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("changeNameModal");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();

    myFormData.append("rut", rut);
    myFormData.append("nombres_rsh", nombres);
    myFormData.append("apellidos_rsh", apellidos);

    const toastId = toast.loading("Guardando...");
    try {
      const response = await updateRSHName(myFormData);
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
    return (
      rut.trim() !== "" && nombres.trim() !== "" && apellidos.trim() !== ""
    );
  };

  return (
    <motion.div
      layout
      layoutRoot
      transition={{ layout: { duration: 0.25 } }}
      className="flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-white p-8 shadow-xl"
    >
      {/* Header */}
      <section className="flex flex-shrink-0 items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight text-slate-700">
          Cambiar Nombres y Apellidos RSH
        </h2>
        <CloseModalButton name="changeNameModal" />
      </section>
      <p className="text-xs text-gray-500">
        Los campos marcados con (*) son obligatorios.
      </p>

      <form onSubmit={handleSubmit} className="overflow-y-auto scrollbar-hide">
        <motion.div className="relative grid min-h-[6rem] gap-6">
          <AnimatePresence mode="wait">
            <motion.section
              key="obligatorio"
              initial={{ opacity: 0, y: 10, height: 160 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 160 }}
              transition={{
                duration: 0.4,
                height: { duration: 0.4 },
                ease: "easeInOut",
              }}
              className="flex flex-col gap-5"
              layout
            >
              {/* Verificar Estilo */}
              <div className="flex flex-col gap-3 pt-2">
                <Input
                  placeHolder="Nombres"
                  label="Nombres *"
                  type="text"
                  nombre="nombres"
                  value={nombres}
                  setData={setNombres}
                  required
                  maxLength={50}
                />
                <Input
                  placeHolder="Apellidos"
                  label="Apellidos *"
                  type="text"
                  nombre="apellidos"
                  value={apellidos}
                  setData={setApellidos}
                  required
                  maxLength={50}
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
    </motion.div>
  );
}
