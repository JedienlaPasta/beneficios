import { loadPdfMake } from "./make";
import { getActaDocDefinition } from "./definitions/acta";
import { arrayBufferToBase64 } from "./fonts";
import type { ActaData } from "./types";

async function fetchLogoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/elquisco-grayscaled-opt.jpg");
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buf);
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

export async function generateActaPDF(data: ActaData) {
  if (typeof window === "undefined") return;
  try {
    const pdfMake = await loadPdfMake();
    const logoDataUrl = await fetchLogoDataUrl();
    const docDefinition = getActaDocDefinition(data, { logoDataUrl });
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
    const logoDataUrl = await fetchLogoDataUrl();
    const docDefinition = getActaDocDefinition(data, { logoDataUrl });
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
