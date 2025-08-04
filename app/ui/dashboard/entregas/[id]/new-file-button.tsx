"use client";
import { createAndDownloadPDFByFolio } from "@/app/lib/actions/entregas";
import React, { useState } from "react";
import { toast } from "sonner";

type Props = {
  children?: React.ReactNode;
  folio: string;
};

export default function GetNewFileButton({ children, folio }: Props) {
  const [name, setName] = useState("");
  console.log(name);
  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const toastId = toast.loading("Generando documento...");

    try {
      const response = await createAndDownloadPDFByFolio(folio, name);

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

      const base64Data = response.data.content;
      const byteArray = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0),
      );

      if (byteArray.length < 500) {
        throw new Error("Archivo PDF corrupto o inválido");
      }

      const footerRange = byteArray.slice(-1024);
      const footerText = new TextDecoder().decode(footerRange);
      if (!footerText.includes("%%EOF")) {
        throw new Error(
          "Invalid PDF structure (missing EOF marker in last 1KB)",
        );
      }

      const blob = new Blob([byteArray], { type: "application/pdf" });
      if (!blob.type.includes("pdf")) {
        throw new Error("Tipo de archivo inválido");
      }
      if (blob.size === 0) {
        throw new Error("Archivo PDF vacío recibido");
      }

      const pdfUrl = URL.createObjectURL(blob);

      const newWindow = window.open(pdfUrl, "_blank");

      if (!newWindow) {
        throw new Error(
          "Popup bloqueado - Por favor permite ventanas emergentes para este sitio",
        );
      }

      // Cleanup for when new tab closes
      newWindow.addEventListener("load", () => {
        // Delay revocation until window closes
        const checkClosed = setInterval(() => {
          if (newWindow.closed) {
            URL.revokeObjectURL(pdfUrl);
            clearInterval(checkClosed);
          }
        }, 1000);
      });

      // Boton de descarga en caso de que no se abra en una nueva pestaña
      toast.success("Documento abierto en nueva pestaña", {
        id: toastId,
        action: {
          label: "Descargar",
          onClick: () => {
            const a = document.createElement("a");
            a.href = pdfUrl;
            a.download = response.data.filename;
            a.click();
            URL.revokeObjectURL(pdfUrl);
          },
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al procesar documento: ${errorMessage}`, {
        id: toastId,
        duration: 5000,
      });
      console.error("PDF handling error:", error);
    }
  };
  return (
    <div className="flex flex-col items-end">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nombre Beneficiario"
        className="rounded-md border px-2 py-1 text-xs text-slate-600 outline-none md:w-64"
      />
      <button
        onClick={handleClick}
        className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-100/70 active:scale-95"
      >
        {children}
      </button>
    </div>
  );
}
