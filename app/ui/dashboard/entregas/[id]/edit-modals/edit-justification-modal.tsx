"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import CloseModalButton from "../../../close-modal-button";
import { CancelButton, SubmitButton } from "../../../submit-button";
import { updateJustificationByFolio } from "@/app/lib/actions/entregas";

type Props = {
  folio: string;
  prevJustification: string;
};

export default function EditJustificationModal({
  folio,
  prevJustification,
}: Props) {
  const [justification, setJustification] = useState<string>(
    prevJustification || "",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("justification");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();

    myFormData.append("justification", justification);

    const toastId = toast.loading("Guardando...");
    try {
      const response = await updateJustificationByFolio(folio, myFormData);
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
    return justification.trim() !== "";
  };

  const handleOverlayClick = async () => {
    const params = new URLSearchParams(searchParams);
    params.delete("justification");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-gray-900/50"
        onClick={handleOverlayClick}
      />
      <motion.div
        layout
        layoutRoot
        transition={{ layout: { duration: 0.25 } }}
        className="z-10 flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-white p-8 shadow-xl"
      >
        {/* Header */}
        <section className="flex flex-shrink-0 items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-700">
            Cambiar Justificación
          </h2>
          <CloseModalButton name="justification" />
        </section>
        <p className="text-xs text-gray-500">
          Puedes redactar una justificación de hasta 390 caracteres.
        </p>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto scrollbar-hide"
        >
          <motion.div className="relative grid min-h-[6rem] gap-6">
            <AnimatePresence mode="wait">
              <motion.section
                key="obligatorio"
                initial={{ opacity: 0, y: 10, height: 400 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -10, height: 400 }}
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
                  <div className="flex grow flex-col gap-1">
                    <label
                      htmlFor={"justification"}
                      className="text-xs text-slate-500"
                    >
                      Justificación
                    </label>
                    <textarea
                      name="justification"
                      id="justification"
                      // cols={30}
                      rows={10}
                      maxLength={390}
                      value={justification}
                      onChange={(e) => setJustification(e.target.value)}
                      placeholder="Justificación..."
                      className="w-full rounded-lg border border-slate-300 bg-transparent bg-white px-4 py-2 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus-within:border-blue-500"
                    ></textarea>
                  </div>
                </div>
              </motion.section>
            </AnimatePresence>
            <div className="z-10 flex gap-3">
              <CancelButton name="justification" isDisabled={isDisabled} />
              <SubmitButton isDisabled={isDisabled || !isFormValid()}>
                {isLoading ? "Guardando..." : "Guardar"}
              </SubmitButton>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
