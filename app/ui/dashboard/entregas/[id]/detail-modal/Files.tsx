"use client";
import { EntregasFiles } from "@/app/lib/definitions";
import pdf from "@/public/pdf.svg";
import Image from "next/image";
import { toast } from "sonner";
import { deletePDFById, downloadPDFById } from "@/app/lib/actions/entregas";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export default function Files({
  item,
  folio,
}: {
  item: EntregasFiles;
  folio: string;
}) {
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [countdown, setCountdown] = useState(2);
  const router = useRouter();

  const deleteFileWithId = deletePDFById.bind(null, item.id);

  const handleDeleteButton = async () => {
    setShowConfirmModal(true);
    setIsDisabled(true);
    setCountdown(2);
  };

  // Effect para manejar el countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isDisabled && countdown > 0) {
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
  }, [isDisabled, countdown]);

  const confirmDelete = async () => {
    setIsDisabled(true);
    const toastId = toast.loading("Eliminando documento...");
    try {
      const response = await deleteFileWithId(folio);
      if (!response.success) {
        throw new Error(response.message);
      }
      toast.success(response.message, { id: toastId });
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al cambiar el estado de la entrega";
      toast.error(message, { id: toastId });
    } finally {
      setShowConfirmModal(false);
      setIsDisabled(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Create a toast ID to reference later
    const toastId = toast.loading("Abriendo documento...");

    try {
      const response = await downloadPDFById(item.id);

      if (!response.success) {
        toast.error(response.message || "Error al descargar documento", {
          id: toastId,
        });
        return;
      }

      if (!response.data) {
        toast.error("No se encontró el contenido del documento", {
          id: toastId,
        });
        return;
      }

      // Convert base64 to blob
      const base64Response = response.data.content;
      const binaryString = window.atob(base64Response);
      const bytes = new Uint8Array(binaryString.length);

      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Open PDF in new tab
      const newWindow = window.open(url, "_blank");

      // Set the document title to the filename
      if (newWindow) {
        newWindow.document.title = response.data.filename || "documento.pdf";
      }

      toast.success("Documento abierto correctamente", { id: toastId });
    } catch (error) {
      toast.error("Error al abrir documento", { id: toastId });
      console.error("Error opening document:", error);
    }
  };

  return (
    <div className="group relative flex cursor-pointer items-center justify-start gap-2 overflow-hidden rounded-md bg-gray-100/80 p-3 shadow-sm transition-shadow hover:shadow">
      <Image className="h-8 w-8" src={pdf} alt="pdf.img" />
      <div className="flex w-[80%] text-left text-xs text-slate-600">
        <div
          className="w-full truncate font-medium tracking-tight"
          title={item.nombre_documento || "Documento"}
        >
          {item.nombre_documento || "Documento"}
        </div>
      </div>

      {/* Overlay with buttons that appear on hover */}
      <div
        className="absolute inset-0 flex items-end justify-center gap-2 rounded-md bg-slate-800/70 pb-3 opacity-0 transition-opacity group-hover:opacity-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-gray-500 text-white transition-all hover:bg-blue-500 active:scale-90"
          onClick={handleDownload}
          disabled={!isHovered}
          title="Ver"
        >
          <Eye className="h-4 w-4" />
          {/* <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg> */}
        </button>
        <button
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded bg-gray-500 text-white transition-all hover:bg-red-500 active:scale-90"
          onClick={handleDeleteButton}
          disabled={!isHovered}
          title="Eliminar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h3 className="mb-3 text-lg font-medium text-gray-900">
              Confirmar eliminación
            </h3>
            <p className="mb-6 text-sm text-gray-500">
              ¿Estás seguro de que deseas eliminar este documento? Esta acción
              no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200`}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDisabled}
                onClick={confirmDelete}
                className={`rounded-md px-4 py-2 text-sm font-medium text-white ${isDisabled ? "cursor-not-allowed bg-red-300" : "bg-red-500 hover:bg-red-600"}`}
              >
                {isDisabled && countdown > 0
                  ? `Eliminar (${countdown})`
                  : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
