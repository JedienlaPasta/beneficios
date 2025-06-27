"use client";

import { uploadPDFByFolio } from "@/app/lib/actions/entregas";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type PdfViewerProps = {
  pdf: Blob | null;
  folio: string;
  setTab: (tab: string) => void;
};

export default function PdfViewer({ pdf, folio, setTab }: PdfViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (pdf) {
      const url = URL.createObjectURL(pdf);
      setPdfUrl(url);

      // Clean up on unmount
      return () => URL.revokeObjectURL(url);
    }
  }, [pdf]);

  const uploadPdf = async () => {
    setIsLoading(true);
    if (pdf) {
      const pdfNamedFile = new File([pdf], "cedula.pdf", {
        type: "application/pdf",
      });
      const formData = new FormData();
      formData.append("file0", pdfNamedFile);
      formData.append("fileCount", "1");
      const toastId = toast.loading("Guardando PDF...");
      try {
        const response = await uploadPDFByFolio(folio, formData);
        if (!response.success) {
          throw new Error(response.message);
        }
        toast.success("PDF guardado exitosamente", { id: toastId });
        router.refresh();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Error al crear la entrega";
        toast.error(message, { id: toastId });
      } finally {
        setIsLoading(false);
        setTab("Resumen");
      }
    }
  };

  if (!pdfUrl)
    return (
      <div className="flex min-h-32 w-full items-center justify-center">
        <p className="text-sm text-slate-600">
          No se ha encontrado ningún PDF...
        </p>
      </div>
    );

  return (
    <div className="flex w-full flex-col gap-4">
      <iframe
        title="PDF Viewer"
        src={pdfUrl}
        className="h-[736px] w-full rounded-b-lg border-none"
      />
      <button
        onClick={uploadPdf}
        disabled={isLoading || !pdf}
        className="flex h-10 items-center justify-center rounded-lg bg-blue-500 px-5 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-600 active:scale-95 disabled:bg-blue-300"
      >
        {isLoading ? (
          <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
        ) : (
          "Guardar PDF"
        )}
      </button>
    </div>
  );
}
