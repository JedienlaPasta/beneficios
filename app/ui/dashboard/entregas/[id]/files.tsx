"use client";
import { SocialFiles } from "@/app/lib/definitions";
import pdf from "@/public/pdf.png";
import Image from "next/image";
import { toast } from "sonner";
import { deletePDFById, downloadPDFById } from "@/app/lib/actions/entregas";
import { useRouter } from "next/navigation";

export function Files({ item }: { item: SocialFiles }) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    toast.custom((t) => (
      <div
        className={`pointer-events-auto flex w-full max-w-md flex-col rounded-lg bg-white shadow-lg`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                ¿Eliminar documento?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-t border-gray-200">
          <button
            onClick={async () => {
              try {
                const response = await deletePDFById(item.id);

                if (response.success) {
                  toast.success("Documento eliminado correctamente");
                  // Refresh the page to show updated document list
                  router.refresh();
                } else {
                  toast.error(
                    response.message || "Error al eliminar documento",
                  );
                }
              } catch (error) {
                toast.error("Error al eliminar documento");
                console.error("Error deleting document:", error);
              } finally {
                toast.dismiss(t);
              }
            }}
            className="flex w-full items-center justify-center rounded-none rounded-bl-lg border border-transparent p-3 text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t)}
            className="flex w-full items-center justify-center rounded-none rounded-br-lg border border-transparent p-3 text-sm font-medium text-gray-700 hover:text-gray-500 focus:outline-none"
          >
            Cancelar
          </button>
        </div>
      </div>
    ));
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Create a toast ID to reference later
    const toastId = toast.loading("Descargando documento...");

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
    <div className="group relative flex cursor-pointer flex-col items-center justify-center rounded-md bg-white p-3 shadow-sm transition-shadow hover:shadow">
      <Image className="mb-1 h-8 w-8" src={pdf} alt="pdf.img" />
      <span className="w-full truncate text-center text-xs font-medium text-slate-700">
        {item.nombre_documento || "Documento"}
      </span>
      <span className="text-center text-[10px] text-slate-500">
        {item.tipo || ".pdf"}
      </span>

      {/* Overlay with buttons that appear on hover */}
      <div className="absolute inset-0 flex items-end justify-center gap-2 rounded-md bg-slate-800/70 pb-3 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          className="flex h-8 w-8 items-center justify-center rounded bg-gray-500 text-white transition-transform hover:scale-110 hover:bg-blue-500 active:scale-90"
          onClick={handleDownload}
          title="Descargar"
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
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
        <button
          className="flex h-8 w-8 items-center justify-center rounded bg-gray-500 text-white transition-transform hover:scale-110 hover:bg-red-500 active:scale-90"
          onClick={handleDelete}
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
    </div>
  );
}
