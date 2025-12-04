import { registerGeistFonts } from "./fonts";
import type { PdfMakeBrowser, PdfFontsModule, VfsMap } from "./types";

/**
 * Carga pdfmake y configura VFS. Ejecutar solo en cliente.
 */
export async function loadPdfMake(): Promise<PdfMakeBrowser> {
  if (typeof window === "undefined") {
    throw new Error("loadPdfMake debe ejecutarse en el navegador.");
  }

  const [pdfMakeModule, pdfFontsModule] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);

  const pdfMakeRaw = (pdfMakeModule as any).default || pdfMakeModule;
  const pdfFontsRaw = ((pdfFontsModule as any).default ||
    pdfFontsModule) as unknown as PdfFontsModule;

  let vfs: VfsMap | undefined;

  if (pdfFontsRaw.pdfMake?.vfs) {
    vfs = pdfFontsRaw.pdfMake.vfs;
  } else if (pdfFontsRaw.vfs) {
    vfs = pdfFontsRaw.vfs;
  } else if (
    pdfFontsRaw &&
    typeof pdfFontsRaw === "object" &&
    "Roboto-Regular.ttf" in pdfFontsRaw
  ) {
    vfs = pdfFontsRaw as unknown as VfsMap;
  }

  if (!vfs) {
    throw new Error("No se pudo localizar 'vfs' (fuentes) en el módulo.");
  }

  const pdfMake = pdfMakeRaw as unknown as PdfMakeBrowser;
  pdfMake.vfs = vfs;

  // Registrar Geist en cliente (si está disponible en /public/fonts)
  try {
    await registerGeistFonts(pdfMake);
  } catch (e) {
    console.warn("Registro de fuentes Geist falló:", e);
  }

  return pdfMake;
}
