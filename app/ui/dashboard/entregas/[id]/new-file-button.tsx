"use client";
import { createAndDownloadPDFByFolio } from "@/app/lib/actions/entregas";
import React from "react";
import { toast } from "sonner";

type Props = {
  children?: React.ReactNode;
  folio: string;
};

export default function GetNewFileButton({ children, folio }: Props) {
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const toastId = toast.loading("Generando documento...");

    try {
      const response = await createAndDownloadPDFByFolio(folio);

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

      // Create blob directly from the Uint8Array
      const pdfContent = response.data.content;
      const blob = new Blob([pdfContent], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      // Open PDF in new tab
      const newWindow = window.open(url, "_blank");
      console.log(response.data.filename);

      // Set the document title to the filename
      if (newWindow) {
        newWindow.document.title = response.data.filename || "Documento.pdf";
      }

      toast.success("Documento abierto correctamente", { id: toastId });
    } catch (error) {
      toast.error("Error al abrir documento", { id: toastId });
      console.error("Error opening document:", error);
    }
  };
  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 transition-all hover:bg-blue-100 active:scale-95"
    >
      {children}
    </button>
  );
}
