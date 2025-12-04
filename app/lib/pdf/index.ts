import { loadPdfMake } from "./make";
import { getActaDocDefinition } from "./definitions/acta";
import type { ActaData } from "./types";

export async function generateActaPDF(data: ActaData) {
  if (typeof window === "undefined") return;
  try {
    const pdfMake = await loadPdfMake();
    const docDefinition = getActaDocDefinition(data);
    pdfMake.createPdf(docDefinition).download(`Acta-${data.folio}.pdf`);
  } catch (error) {
    console.error("Error al descargar PDF:", error);
    alert("Error al generar la descarga.");
  }
}

export async function getPdfBlobUrl(data: ActaData): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const pdfMake = await loadPdfMake();
    const docDefinition = getActaDocDefinition(data);
    return new Promise((resolve) => {
      const generator = pdfMake.createPdf(docDefinition);
      generator.getBlob((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        resolve(url);
      });
    });
  } catch (error) {
    console.error("Error al previsualizar PDF:", error);
    return null;
  }
}