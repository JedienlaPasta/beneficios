"use client";
import { deleteEntregaByFolio } from "@/app/lib/actions/entregas";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

export default function DeleteEntregasButton({ folio }: { folio: string }) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("detailsModal");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const deleteCampaignWithId = deleteEntregaByFolio.bind(null, folio);

  // Mostrar modal de confirmación en lugar de eliminar directamente
  const handleDeleteButton = async () => {
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    setIsDisabled(true);
    toast.promise(deleteCampaignWithId(), {
      loading: "Eliminando entrega...",
      success: async (response) => {
        setShowConfirmModal(false);
        setIsDisabled(false);
        closeModal();
        return {
          message: response.message,
        };
      },
      error: () => ({
        message: "Error al eliminar la entrega",
        description: "No se pudo eliminar la entrega. Intente nuevamente.",
      }),
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleDeleteButton}
        title="Eliminar Entregas"
        className="rounded-md bg-red-50 px-4 py-1.5 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-100"
      >
        Eliminar
      </button>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-lg font-medium text-gray-900">
              Confirmar eliminación
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar esta entrega? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 ${isDisabled ? "cursor-not-allowed" : "hover:bg-gray-200"}`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white ${isDisabled ? "cursor-not-allowed bg-red-300" : "bg-red-500 hover:bg-red-600"}`}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
