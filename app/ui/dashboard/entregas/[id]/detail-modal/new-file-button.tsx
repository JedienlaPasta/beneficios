"use client";

import { ActaData } from "@/app/lib/pdf/types";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  children?: React.ReactNode;
  folio: string;
};

export default function GetNewFileButton({ folio }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/acta/${folio}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo obtener el acta");
      const data: ActaData = await res.json();

      const { getPdfBlobUrl } = await import("../../../../../lib/pdf");
      const blobUrl = await getPdfBlobUrl(data);

      if (!blobUrl) {
        throw new Error("No se pudo generar el PDF");
      }

      const win = window.open(blobUrl, "_blank", "noopener,noreferrer");
      if (!win) {
        const link = document.createElement("a");
        link.href = blobUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();
      }

      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      console.error(e);
      toast.error("Error al guardar el PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-800 px-3 py-1 text-sm font-medium text-white transition-all hover:border-slate-900 hover:bg-slate-900 active:scale-95"
      disabled={isLoading}
      onClick={onClick}
    >
      {/* {children} */}
      {isLoading ? (
        <>
          <div className="mr-1 size-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
          Generando...
        </>
      ) : (
        "Acta PDF"
      )}
    </button>
  );
}
