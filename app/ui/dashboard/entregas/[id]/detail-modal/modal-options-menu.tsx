"use client";
import { useEffect, useRef, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { TbRefresh } from "react-icons/tb";
import { AiOutlineSetting } from "react-icons/ai";
import { GoStop } from "react-icons/go";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  deleteEntregaByFolio,
  toggleDiscardEntregaByFolio,
} from "@/app/lib/actions/entregas";

export default function DetailsModalOptionsMenu({
  folio,
  estadoDocs,
}: {
  folio: string;
  estadoDocs: string;
}) {
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showConfirmDiscardModal, setShowConfirmDiscardModal] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [countdown, setCountdown] = useState(2);
  const modalRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const closeModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("detailsModal");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleDeleteButton = async () => {
    setShowConfirmDeleteModal(true);
    setIsDisabled(true);
    setCountdown(2);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      (showConfirmDeleteModal || showConfirmDiscardModal) &&
      isDisabled &&
      countdown > 0
    ) {
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
  }, [showConfirmDeleteModal, showConfirmDiscardModal, isDisabled, countdown]);

  const confirmDelete = async () => {
    setIsDisabled(true);
    const toastId = toast.loading("Eliminando entrega...");
    try {
      const response = await deleteEntregaByFolio(folio);
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message, { id: toastId });
      closeModal();
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error al eliminar la entrega";
      toast.error(message, { id: toastId });
    } finally {
      setShowConfirmDeleteModal(false);
      setIsDisabled(false);
    }
  };

  const handleDiscardButton = async () => {
    setShowConfirmDiscardModal(true);
    setIsDisabled(true);
    setCountdown(2);
  };

  const confirmDiscard = async () => {
    setIsDisabled(true);
    let newState = "Finalizado"; // Este estado se rechaza
    if (estadoDocs === "En Curso") newState = "Anulado";
    else if (estadoDocs === "Anulado") newState = "En Curso";

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
      setShowConfirmDiscardModal(false);
      setIsDisabled(false);
    }
  };

  const dropdownOptionStyle =
    "pl-2 pr-6 py-2 divide-y flex items-center gap-2 cursor-pointer rounded-md group transition-all duration-300 text-sm text-gray-600";

  // Controladores del dropdown vvvv
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  const toggleModal = () => {
    if (!showConfirmDeleteModal && !showConfirmDiscardModal)
      setModalOpen((prev) => !prev);
  };

  return (
    <div
      ref={modalRef}
      onClick={toggleModal}
      className={`relative select-none text-xl ${showConfirmDeleteModal || showConfirmDiscardModal ? "" : "cursor-pointer"}`}
    >
      <AiOutlineSetting className="size-7 flex-1 rotate-90 rounded-md border border-slate-200 bg-white p-1 text-slate-500 hover:bg-gray-100" />
      {modalOpen && (
        <ul className="absolute right-0 top-8 z-10 overflow-hidden text-nowrap rounded-lg border border-slate-200 bg-white p-1 text-sm transition-all">
          <li>
            <button
              onClick={handleDeleteButton}
              className={`w-full hover:bg-slate-100/70 ${dropdownOptionStyle}`}
            >
              <span className="rounded-md p-1 transition-all duration-300 group-hover:bg-rose-100">
                <BiTrash className="text-slate-400 group-hover:text-rose-500" />
              </span>
              <span className="border-none text-left">Eliminar</span>
            </button>
          </li>
          <li>
            <button
              onClick={handleDiscardButton}
              className={`w-full hover:bg-slate-100/70 ${dropdownOptionStyle}`}
            >
              <span
                className={`rounded-md p-1 transition-all duration-300 ${estadoDocs === "Anulado" ? "group-hover:bg-blue-100" : "group-hover:bg-red-100"}`}
              >
                {estadoDocs === "Anulado" ? (
                  <TbRefresh className="text-slate-400 group-hover:text-blue-500" />
                ) : (
                  <GoStop className="text-slate-400 group-hover:text-rose-500" />
                )}
              </span>
              <span className="border-none text-left">
                {estadoDocs === "Anulado" ? "Restaurar" : "Anular"}
              </span>
            </button>
          </li>
        </ul>
      )}
      {/* Modals de confirmación Eliminar/Anular/Restaurar */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-lg font-medium text-gray-900">
              Confirmar eliminación
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar esta entrega? Esta acción no
              se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteModal(false)}
                className={`rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-transform hover:bg-gray-200 focus:scale-95`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDisabled}
                onClick={confirmDelete}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-transform focus:scale-95 ${isDisabled ? "cursor-not-allowed bg-rose-300" : "bg-rose-500 hover:bg-rose-600"}`}
              >
                {isDisabled && countdown > 0
                  ? `Eliminar (${countdown})`
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showConfirmDiscardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-lg font-medium text-gray-900">
              Confirmar{" "}
              {estadoDocs === "Anulado" ? "Restauración" : "Anulación"}
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              ¿Estás seguro de que deseas{" "}
              {estadoDocs === "Anulado" ? "restaurar" : "anular"} esta entrega?
              Esta acción es reversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowConfirmDiscardModal(false)}
                className={`rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-transform hover:bg-gray-200 focus:scale-95`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDisabled}
                onClick={confirmDiscard}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white transition-transform focus:scale-95 ${isDisabled ? "cursor-not-allowed bg-rose-300" : "bg-rose-500 hover:bg-rose-600"}`}
              >
                {isDisabled && countdown > 0
                  ? `${estadoDocs === "Anulado" ? "Restaurar" : "Anular"} (${countdown})`
                  : `${estadoDocs === "Anulado" ? "Restaurar" : "Anular"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
