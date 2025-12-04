import type { PdfMakeBrowser } from "./types";

// Conversión segura de ArrayBuffer a base64 (en chunks)
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Registra las fuentes Geist en el VFS y mapea la familia "Geist"
export async function registerGeistFonts(pdfMake: PdfMakeBrowser) {
  if ((pdfMake as any).__geistRegistered) return;

  const regularUrl = "/fonts/Geist-Regular.ttf";
  const boldUrl = "/fonts/Geist-Bold.ttf";
  const italicsUrl = "/fonts/Geist-Italic.ttf"; // opcional

  const [regularRes, boldRes, italicsRes] = await Promise.allSettled([
    fetch(regularUrl),
    fetch(boldUrl),
    fetch(italicsUrl),
  ]);

  const getArrayBuffer = async (
    res: PromiseSettledResult<Response>,
  ): Promise<ArrayBuffer | null> => {
    if (res.status === "fulfilled" && res.value.ok) {
      return res.value.arrayBuffer();
    }
    return null;
  };

  const [regularBuf, boldBuf, italicsBuf] = await Promise.all([
    getArrayBuffer(regularRes),
    getArrayBuffer(boldRes),
    getArrayBuffer(italicsRes),
  ]);

  if (!regularBuf) {
    console.warn("No se encontró Geist-Regular.ttf en /public/fonts.");
    return;
  }

  pdfMake.vfs["Geist-Regular.ttf"] = arrayBufferToBase64(regularBuf);
  if (boldBuf) pdfMake.vfs["Geist-Bold.ttf"] = arrayBufferToBase64(boldBuf);
  if (italicsBuf)
    pdfMake.vfs["Geist-Italic.ttf"] = arrayBufferToBase64(italicsBuf);

  pdfMake.fonts = {
    ...(pdfMake.fonts || {}),
    Geist: {
      normal: "Geist-Regular.ttf",
      bold: boldBuf ? "Geist-Bold.ttf" : "Geist-Regular.ttf",
      italics: italicsBuf ? "Geist-Italic.ttf" : "Geist-Regular.ttf",
      bolditalics: boldBuf
        ? "Geist-Bold.ttf"
        : italicsBuf
          ? "Geist-Italic.ttf"
          : "Geist-Regular.ttf",
    },
  };

  (pdfMake as any).__geistRegistered = true;
}
