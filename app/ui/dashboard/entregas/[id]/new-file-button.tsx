"use client";

import { ActaData } from "@/app/lib/pdf/types";

type Props = {
  children?: React.ReactNode;
  folio: string;
};

export default function GetNewFileButton({ children, folio }: Props) {
  const onClick = async () => {
    try {
      const res = await fetch(`/api/acta/${folio}`, { cache: "no-store" });
      if (!res.ok) throw new Error("No se pudo obtener el acta");
      const data: ActaData = await res.json();

      const { getPdfBlobUrl } = await import("../../../../lib/pdf");
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
    }
  };

  return (
    <button
      className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 transition-all hover:border-blue-200 hover:bg-blue-100/70 active:scale-95"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
