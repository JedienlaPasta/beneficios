import type { TDocumentDefinitions } from "pdfmake/interfaces";

export type VfsMap = Record<string, string>;

export interface PdfFontsModule {
  pdfMake?: { vfs: VfsMap };
  vfs?: VfsMap;
  default?: PdfFontsModule;
}

export interface PdfMakeBrowser {
  vfs: VfsMap;
  createPdf: (docDefinition: TDocumentDefinitions) => {
    download: (fileName?: string) => void;
    open: () => void;
    getBlob: (cb: (blob: Blob) => void) => void;
  };
  fonts?: Record<
    string,
    {
      normal: string;
      bold?: string;
      italics?: string;
      bolditalics?: string;
    }
  >;
}

export interface ActaData {
  folio: string;
  numeroEntrega: number;
  profesional: { fecha: string; nombre: string; cargo: string };
  beneficiario: {
    nombre: string;
    run: string;
    domicilio: string;
    tramo: string;
    telefono: string;
    folioRSH: string;
    edad?: number | string;
  };
  receptor?: {
    nombre: string;
    run: string;
    domicilio: string;
    relacion: string;
    telefono: number | string;
    tramo?: string;
    folioRSH?: string;
  };
  beneficios: Array<{
    nombre: string;
    codigo?: string;
    detalles: Array<{ label: string; value: string }>;
  }>;
  justificacion?: string;
}
