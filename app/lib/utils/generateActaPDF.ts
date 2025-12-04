import type {
  TDocumentDefinitions,
  Content,
  StyleDictionary,
  TableCell,
} from "pdfmake/interfaces";

// ==========================================
// 1. DEFINICIÓN DE TIPOS
// ==========================================

type VfsMap = Record<string, string>;

interface PdfFontsModule {
  pdfMake?: { vfs: VfsMap };
  vfs?: VfsMap;
  default?: PdfFontsModule;
}

interface PdfMakeBrowser {
  vfs: VfsMap;
  createPdf: (docDefinition: TDocumentDefinitions) => {
    download: (fileName?: string) => void;
    open: () => void;
    getBlob: (cb: (blob: Blob) => void) => void;
  };
  // Permite definir fuentes custom
  fonts?: Record<
    string,
    {
      normal: string;
      bold?: string;
    }
  >;
}

// Tipo de tus datos
export interface ActaData {
  folio: string;
  numeroEntrega: number;
  profesional: {
    fecha: string;
    nombre: string;
    cargo: string;
  };
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
    tramo?: string; // Agregado por si acaso
    folioRSH?: string; // Agregado por si acaso
  };
  beneficios: Array<{
    nombre: string;
    codigo?: string;
    detalles: Array<{ label: string; value: string }>;
  }>;
  justificacion?: string;
}

// ==========================================
// 2. CONSTANTES DE DISEÑO
// ==========================================
const PRIMARY_COLOR = "#333333";
const ACCENT_COLOR = "#074d8f";
const SUBTEXT_COLOR = "#666666";
const DIVIDER_COLOR = "#E5E7EB";

// ==========================================
// 3. HELPERS INTERNOS (LÓGICA DE CARGA Y DISEÑO)
// ==========================================

/**
 * Carga la librería PDFMake y configura el VFS para las fuentes.
 * Maneja la compatibilidad entre Webpack y Turbopack.
 */
async function loadPdfMake(): Promise<PdfMakeBrowser> {
  const [pdfMakeModule, pdfFontsModule] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);

  const pdfMakeRaw = pdfMakeModule.default || pdfMakeModule;
  const pdfFontsRaw = (pdfFontsModule.default ||
    pdfFontsModule) as unknown as PdfFontsModule;

  let vfs: VfsMap | undefined = undefined;

  if (pdfFontsRaw.pdfMake && pdfFontsRaw.pdfMake.vfs) {
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

/**
 * Genera la estructura JSON del documento (Layout)
 * Esta función es PURA: Recibe datos y devuelve configuración.
 */
function getDocDefinition(data: ActaData): TDocumentDefinitions {
  // --- HELPERS VISUALES ---

  // Crea una celda de tabla con Label: Value
  const createInfoCell = (
    label: string,
    value: string | number | undefined,
    colSpan: number = 1,
  ): TableCell => {
    if (!value) return { text: "", colSpan };
    return {
      stack: [
        {
          text: [
            { text: `${label}: `, bold: true, color: "black", fontSize: 10 },
            { text: String(value), color: SUBTEXT_COLOR, fontSize: 10 },
          ],
          margin: [0, 2, 0, 4],
        },
      ],
      colSpan,
    };
  };

  // Crea la barra negra de título de sección
  const createSectionTitle = (title: string): Content => ({
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: title,
            style: "sectionTitle",
            fillColor: PRIMARY_COLOR,
            border: [false, false, false, false],
          },
        ],
      ],
    },
    layout: "noBorders",
    margin: [0, 0, 0, 10],
  });

  // Lógica de datos
  const shouldDisplayReceptor =
    data?.receptor?.nombre?.trim() !== "" && data?.receptor?.run !== "";

  const numeroEntrega = data?.numeroEntrega ?? undefined;
  const ordinalEntrega =
    typeof numeroEntrega === "number"
      ? ["Primera", "Segunda", "Tercera"][numeroEntrega - 1] ||
        `${numeroEntrega}ª`
      : undefined;

  // --- ESTRUCTURA DEL PDF ---
  return {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],

    // Usa Geist por defecto en el documento
    defaultStyle: { font: "Geist" },

    content: [
      // === HEADER ===
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "ACTA DE ENTREGA",
                fontSize: 24,
                bold: true,
                color: "#111",
                characterSpacing: 0.3,
              },
              {
                text: "AYUDA ASISTENCIAL MUNICIPAL",
                fontSize: 12,
                bold: true,
                color: ACCENT_COLOR,
                margin: [0, 5, 0, 0],
                characterSpacing: 0.5,
              },
              {
                margin: [0, 2, 0, 0],
                text: [
                  {
                    text: `${data.profesional.fecha} `,
                    fontSize: 9,
                    color: SUBTEXT_COLOR,
                  },
                  {
                    text: "| El Quisco, Chile | ",
                    fontSize: 9,
                    color: SUBTEXT_COLOR,
                  },
                  ordinalEntrega
                    ? {
                        text: `Entrega: ${ordinalEntrega} del año`,
                        bold: true,
                        fontSize: 9,
                        color: SUBTEXT_COLOR,
                      }
                    : "",
                ],
              },
              {
                text: `Folio: ${data.folio}`,
                fontSize: 10,
                bold: true,
                color: PRIMARY_COLOR,
                margin: [0, 2, 0, 15],
              },
            ],
          },
          // Logo
          {
            width: 80,
            stack: [
              {
                text: "Muni El Quisco",
                fontSize: 8,
                alignment: "center",
                color: "#999",
                margin: [0, 10, 0, 0],
              },
            ],
            alignment: "right",
          },
        ],
      },

      // === INFORMACIÓN DEL BENEFICIARIO ===
      createSectionTitle("INFORMACIÓN DEL BENEFICIARIO"),
      {
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => DIVIDER_COLOR,
        },
        table: {
          widths: ["65%", "35%"],
          body: [
            [
              createInfoCell("Nombre", data.beneficiario.nombre),
              createInfoCell("R.U.N", data.beneficiario.run),
            ],
            [
              createInfoCell("Domicilio", data.beneficiario.domicilio),
              createInfoCell("Tramo", data.beneficiario.tramo),
            ],
            [
              createInfoCell("Teléfono", data.beneficiario.telefono),
              createInfoCell("Folio", data.beneficiario.folioRSH),
            ],
            ...(data.beneficiario.edad
              ? [[createInfoCell("Edad", data.beneficiario.edad), ""]]
              : []),
          ],
        },
        margin: [0, 0, 0, 15],
      },

      // === INFORMACIÓN DEL RECEPTOR (CONDICIONAL) ===
      ...(shouldDisplayReceptor && data.receptor
        ? [
            createSectionTitle("INFORMACIÓN DEL RECEPTOR"),
            {
              layout: {
                hLineWidth: () => 0.5,
                vLineWidth: () => 0,
                hLineColor: () => DIVIDER_COLOR,
              },
              table: {
                widths: ["35%", "65%"],
                body: [
                  [
                    createInfoCell("Nombre", data.receptor.nombre),
                    createInfoCell("R.U.N", data.receptor.run),
                  ],
                  [
                    createInfoCell("Domicilio", data.receptor.domicilio, 2),
                    {}, // Columna vacía por colspan
                  ],
                  [createInfoCell("Teléfono", data.receptor.telefono, 2), {}],
                  [
                    createInfoCell(
                      "Relación con beneficiario",
                      data.receptor.relacion,
                      2,
                    ),
                    {},
                  ],
                ],
              },
              margin: [0, 0, 0, 15],
            } as Content,
          ]
        : []),

      // === DETALLE DE LA ENTREGA ===
      createSectionTitle("DETALLE DE LA ENTREGA"),
      {
        columnGap: 20,
        columns: [
          {
            width: "*",
            stack: data.beneficios.map((b) => ({
              margin: [0, 0, 0, 12],
              stack: [
                {
                  columns: [
                    {
                      text: b.nombre,
                      bold: true,
                      fontSize: 10,
                      color: PRIMARY_COLOR,
                    },
                    {
                      text: b.codigo || "PA",
                      fontSize: 9,
                      color: "#9CA3AF",
                      alignment: "right",
                    },
                  ],
                },
                {
                  margin: [8, 4, 0, 6],
                  stack: b.detalles.map((d) => ({
                    columns: [
                      {
                        text: "•",
                        width: 10,
                        color: ACCENT_COLOR,
                        fontSize: 10,
                      },
                      {
                        text: [
                          {
                            text: d.label ? `${d.label}: ` : "",
                            bold: true,
                            color: "#444",
                            fontSize: 9,
                          },
                          {
                            text: d.value,
                            color: SUBTEXT_COLOR,
                            fontSize: 9,
                          },
                        ],
                      },
                    ],
                    margin: [0, 0, 0, 2],
                  })),
                },
                {
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: 0,
                      x2: 515,
                      y2: 0,
                      lineWidth: 0.5,
                      lineColor: DIVIDER_COLOR,
                    },
                  ],
                },
              ],
            })),
          },
        ],
      },

      // === OBSERVACIONES / JUSTIFICACIÓN ===
      ...(data.justificacion
        ? [
            createSectionTitle("OBSERVACIONES / JUSTIFICACIÓN"),
            {
              text: data.justificacion,
              fontSize: 10,
              color: SUBTEXT_COLOR,
              alignment: "justify",
              lineHeight: 1.2,
              margin: [0, 0, 0, 40],
            } as Content,
          ]
        : []),

      // === FIRMAS ===
      {
        margin: [0, 40, 0, 0],
        columns: [
          {
            width: "*",
            stack: [
              {
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: 220,
                    y2: 0,
                    lineWidth: 1,
                    lineColor: "#CCCCCC",
                  },
                ],
                margin: [0, 0, 0, 5],
              },
              {
                text: data.profesional.nombre,
                fontSize: 9,
                bold: true,
                alignment: "center",
                color: PRIMARY_COLOR,
              },
              {
                text: data.profesional.cargo,
                fontSize: 8,
                alignment: "center",
                color: SUBTEXT_COLOR,
              },
            ],
            alignment: "center",
          },
          { width: 40, text: "" },
          {
            width: "*",
            stack: [
              {
                canvas: [
                  {
                    type: "line",
                    x1: 0,
                    y1: 0,
                    x2: 220,
                    y2: 0,
                    lineWidth: 1,
                    lineColor: "#CCCCCC",
                  },
                ],
                margin: [0, 0, 0, 5],
              },
              {
                text: data.receptor?.nombre || "Sin Receptor",
                fontSize: 9,
                bold: true,
                alignment: "center",
                color: PRIMARY_COLOR,
              },
              {
                text: "Firma de conformidad y recepción",
                fontSize: 8,
                alignment: "center",
                color: SUBTEXT_COLOR,
              },
            ],
            alignment: "center",
          },
        ],
      },
    ],

    styles: {
      sectionTitle: {
        fontSize: 11,
        bold: true,
        color: "white",
        margin: [4, 4, 4, 4],
        characterSpacing: 0.8,
      },
    } as StyleDictionary,

    footer: (currentPage, pageCount) => {
      return {
        stack: [
          {
            text: "I. Municipalidad de El Quisco - Departamento Social - Av. Isidoro Dubournais 413",
            alignment: "center",
            fontSize: 8,
            color: "#999",
          },
          {
            text: `Documento generado electrónicamente el ${new Date().toLocaleDateString()}.`,
            alignment: "center",
            fontSize: 8,
            color: "#999",
            margin: [0, 2, 0, 0],
          },
        ],
        margin: [40, 10, 40, 0],
      };
    },
  };
}

// ==========================================
// 4. FUNCIONES EXPORTABLES (PÚBLICAS)
// ==========================================

/**
 * Genera y descarga el PDF automáticamente.
 * Úsalo en el botón "Descargar".
 */
export async function generateActaPDF(data: ActaData) {
  if (typeof window === "undefined") return;

  try {
    const pdfMake = await loadPdfMake();
    const docDefinition = getDocDefinition(data);
    pdfMake.createPdf(docDefinition).download(`Acta-${data.folio}.pdf`);
  } catch (error) {
    console.error("Error al descargar PDF:", error);
    alert("Error al generar la descarga.");
  }
}

/**
 * Genera una URL (Blob) del PDF para previsualizarlo en un Iframe.
 * Úsalo en tu componente de Vista Previa.
 */
export async function getPdfBlobUrl(data: ActaData): Promise<string | null> {
  if (typeof window === "undefined") return null;

  try {
    const pdfMake = await loadPdfMake();
    const docDefinition = getDocDefinition(data);

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

// Conversión segura de ArrayBuffer a base64 (en chunks)
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // evita desbordar el stack
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// Registra las fuentes Geist en el VFS y mapea la familia "Geist"
async function registerGeistFonts(pdfMake: PdfMakeBrowser) {
  // Evita doble registro en la misma sesión
  if ((pdfMake as any).__geistRegistered) return;

  // Rutas en /public/fonts
  const regularUrl = "/fonts/Geist-Regular.ttf";
  const boldUrl = "/fonts/Geist-Bold.ttf";

  // Cargar fuentes disponibles
  const [regularRes, boldRes] = await Promise.allSettled([
    fetch(regularUrl),
    fetch(boldUrl),
  ]);

  const getArrayBuffer = async (
    res: PromiseSettledResult<Response>,
  ): Promise<ArrayBuffer | null> => {
    if (res.status === "fulfilled" && res.value.ok) {
      return res.value.arrayBuffer();
    }
    return null;
  };

  const [regularBuf, boldBuf] = await Promise.all([
    getArrayBuffer(regularRes),
    getArrayBuffer(boldRes),
  ]);

  if (!regularBuf) {
    console.warn(
      "No se encontró Geist-Regular.ttf en /public/fonts. Se mantendrá la fuente por defecto.",
    );
    return;
  }

  // Insertar en VFS
  pdfMake.vfs["Geist-Regular.ttf"] = arrayBufferToBase64(regularBuf);
  if (boldBuf) pdfMake.vfs["Geist-Bold.ttf"] = arrayBufferToBase64(boldBuf);

  // Mapear familia "Geist"
  pdfMake.fonts = {
    ...(pdfMake.fonts || {}),
    Geist: {
      normal: "Geist-Regular.ttf",
      bold: boldBuf ? "Geist-Bold.ttf" : "Geist-Regular.ttf",
    },
  };

  (pdfMake as any).__geistRegistered = true;
}
