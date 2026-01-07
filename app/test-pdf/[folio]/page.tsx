"use client";
import { getPdfBlobUrl } from "@/app/lib/pdf";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import type { ActaData } from "@/app/lib/pdf/types";

export default function PageDevPreview() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const { folio } = useParams() as { folio: string };

  useEffect(() => {
    const generar = async () => {
      try {
        if (!folio) return;

        // Pide los datos al servidor
        const res = await fetch(`/api/acta/${folio}`, { cache: "no-store" });
        if (!res.ok) {
          throw new Error("No se pudo obtener el acta");
        }
        const data: ActaData = await res.json();
        console.log(data);

        // Genera el PDF en el cliente con pdfmake
        const url = await getPdfBlobUrl(data);
        setPdfUrl(url);
      } catch (e) {
        console.error(e);
        // Opcional: fallback a datos dummy si la API falla
        // const url = await getPdfBlobUrl(datosPrueba as ActaData);
        // setPdfUrl(url);
      }
    };
    generar();
  }, [folio]);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            className="h-full w-full"
            title="Vista Previa PDF"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400">
            Generando vista previa...
          </div>
        )}
      </div>
    </div>
  );
}
