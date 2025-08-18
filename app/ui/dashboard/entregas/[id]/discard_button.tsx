"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { toggleDiscardEntregaByFolio } from "@/app/lib/actions/entregas";

export default function DiscardEntregasButton({
  folio,
  estadoDocumentos,
}: {
  folio: string;
  estadoDocumentos: string;
}) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [countdown, setCountdown] = useState(2);
  const router = useRouter();

  // Mostrar modal de confirmación en lugar de eliminar directamente
  const handleDiscardButton = async () => {
    setShowConfirmModal(true);
    setIsDisabled(true);
    setCountdown(2);
  };

  // Effect para manejar el countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (showConfirmModal && isDisabled && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showConfirmModal, isDisabled, countdown]);

  const confirmDiscard = async () => {
    setIsDisabled(true);
    let newState = "Finalizado"; // Este estado se rechaza
    if (estadoDocumentos === "En Curso") newState = "Anulado";
    else if (estadoDocumentos === "Anulado") newState = "En Curso";

    const toastId = toast.loading("Anulando entrega...");
    try {
      const response = await toggleDiscardEntregaByFolio(folio, newState);

      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message, { id: toastId });
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al anular la entrega";
      toast.error(message, { id: toastId });
    } finally {
      setShowConfirmModal(false);
      setIsDisabled(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDiscardButton}
        title={
          estadoDocumentos === "Anulado"
            ? "Restaurar Entrega"
            : "Anular Entrega"
        }
        className={`rounded-md border px-3 py-1 text-sm font-medium transition-all duration-300 active:scale-95 ${estadoDocumentos === "Anulado" ? "border-blue-100 bg-blue-50 text-blue-600 hover:border-blue-200 hover:bg-blue-100/70" : "border-red-100 bg-red-50 text-red-400 hover:border-red-200 hover:bg-red-100/70"}`}
      >
        {estadoDocumentos === "Anulado" ? "Restaurar" : "Anular"}
      </button>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-lg font-medium text-gray-900">
              Confirmar{" "}
              {estadoDocumentos === "Anulado" ? "Restauración" : "Anulación"}
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              ¿Estás seguro de que deseas{" "}
              {estadoDocumentos === "Anulado" ? "restaurar" : "anular"} esta
              entrega? Esta acción es reversible.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-transform hover:bg-gray-200 focus:scale-95`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDisabled}
                onClick={confirmDiscard}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-transform focus:scale-95 ${isDisabled ? "cursor-not-allowed bg-red-300" : "bg-red-500 hover:bg-red-600"}`}
              >
                {isDisabled && countdown > 0
                  ? `${estadoDocumentos === "Anulado" ? "Restaurar" : "Anular"} (${countdown})`
                  : `${estadoDocumentos === "Anulado" ? "Restaurar" : "Anular"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
