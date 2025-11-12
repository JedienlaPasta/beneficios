"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import CloseModalButton from "../../close-modal-button";
import { CancelButton, SubmitButton } from "../../submit-button";
import UserDropdown from "../user-dropdown";
import RoleGuard from "@/app/ui/auth/role-guard";
import { usersList } from "@/app/lib/data/static-data";
import { updateSupervisorByFolio } from "@/app/lib/actions/entregas";

type Props = {
  folio: string;
  prevSupervisor: string;
};

export default function EditSupervisorModal({ folio, prevSupervisor }: Props) {
  const [correo, setCorreo] = useState<string>(
    usersList.find((user) => user.name === prevSupervisor)?.email || "",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("supervisor");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setIsDisabled(true);

    const myFormData = new FormData();
    myFormData.append("supervisor", correo);

    const toastId = toast.loading("Guardando...");
    try {
      const response = await updateSupervisorByFolio(folio, myFormData);
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
    return correo.trim() !== "";
  };

  const handleOverlayClick = async () => {
    const params = new URLSearchParams(searchParams);
    params.delete("supervisor");
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
        className="z-10 flex max-h-full w-[32rem] max-w-full shrink-0 flex-col gap-0.5 overflow-hidden rounded-xl bg-white p-8 shadow-xl"
      >
        {/* Header */}
        <section className="flex flex-shrink-0 items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-700">
            Cambiar Encargado
          </h2>
          <CloseModalButton name="supervisor" />
        </section>
        <p className="mb-2 text-xs text-gray-500">
          Puedes modificar el encargado que realizó la entrega.
        </p>

        <RoleGuard allowedRoles={["Administrador"]}>
          <form
            onSubmit={handleSubmit}
            className="overflow-y-autos scrollbar-hide"
          >
            <motion.div className="relative flex min-h-[12srem] flex-col justify-between gap-6">
              <AnimatePresence mode="wait">
                <motion.section
                  key="supervisor"
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
                      <UserDropdown
                        placeHolder="tu@correo.com..."
                        label="Encargado"
                        name="correo"
                        userEmail={correo}
                        setUserEmail={setCorreo}
                      />
                    </div>
                  </div>
                </motion.section>
              </AnimatePresence>
              <div className="z-10 flex gap-3">
                <CancelButton name="supervisor" isDisabled={isDisabled} />
                <SubmitButton isDisabled={isDisabled || !isFormValid()}>
                  {isLoading ? "Guardando..." : "Guardar"}
                </SubmitButton>
              </div>
            </motion.div>
          </form>
        </RoleGuard>
      </motion.div>
    </div>
  );
}
