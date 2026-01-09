"use client";
import { useState, Fragment, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import CloseModalButton from "../../../CloseModalButton";
import { CancelButton, SubmitButton } from "../../../SubmitButton";
import { updateBeneficioDetailsById } from "@/app/lib/actions/entregas";
import { EntregaByFolio } from "@/app/lib/definitions";
import { DynamicFieldsRenderer } from "../../new-entrega-modal/DynamicFieldsRenderer";

type Props = {
  folio: string;
  beneficio: EntregaByFolio;
};

export default function EditBeneficioModal({ folio, beneficio }: Props) {
  // Parse initial details
  type DetailValue = string | number | boolean | null;
  let initialDetails: Record<string, DetailValue> = {};
  try {
    if (beneficio.campos_adicionales) {
      initialDetails = JSON.parse(beneficio.campos_adicionales) as Record<
        string,
        DetailValue
      >;
    }
  } catch (e) {
    console.error("Error parsing details", e);
  }

  const [editValues, setEditValues] =
    useState<Record<string, any>>(initialDetails);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("editBeneficio");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const toastId = toast.loading("Actualizando detalles...");
    try {
      const newDetails = JSON.stringify(editValues);
      const response = await updateBeneficioDetailsById(
        beneficio.id,
        newDetails,
        folio,
      );

      if (!response.success) throw new Error(response.message);

      toast.success("Detalles actualizados", { id: toastId });
      closeModal();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al actualizar";
      toast.error(message, { id: toastId });
      setIsDisabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = () => {
    closeModal();
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setEditValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
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
        className="z-10 flex max-h-full w-[30rem] max-w-full shrink-0 flex-col gap-2 overflow-hidden rounded-xl bg-white p-8 shadow-xl"
      >
        {/* Header */}
        <section className="flex flex-shrink-0 items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-700">
            Editar Detalles de Beneficio
          </h2>
          <CloseModalButton name="editBeneficio" />
        </section>
        <p className="text-xs text-gray-500">
          Modifica los detalles específicos de este beneficio.
        </p>

        <motion.form
          onSubmit={handleSubmit}
          className="relative mx-0.5 grid min-h-[6rem] gap-4"
        >
          <AnimatePresence mode="wait">
            <motion.section
              key="obligatorio"
              initial={{ opacity: 0, y: 10, height: 200 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 200 }}
              transition={{
                duration: 0.4,
                height: { duration: 0.4 },
                ease: "easeInOut",
              }}
              className="flex flex-col gap-4"
              layout
            >
              <DynamicFieldsRenderer
                schemaString={beneficio.esquema_formulario || "[]"}
                values={editValues}
                onChange={handleFieldChange}
              />

              <div className="z-10 grid gap-3 xs:grid-cols-2">
                <CancelButton name="editBeneficio" isDisabled={isDisabled} />
                <SubmitButton isDisabled={isDisabled}>
                  {isLoading ? "Guardando..." : "Guardar"}
                </SubmitButton>
              </div>
            </motion.section>
          </AnimatePresence>
        </motion.form>
      </motion.div>
    </div>
  );
}
