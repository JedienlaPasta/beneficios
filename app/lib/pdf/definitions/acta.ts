import type {
  TDocumentDefinitions,
  Content,
  StyleDictionary,
  TableCell,
} from "pdfmake/interfaces";
import type { ActaData } from "../types";

const PRIMARY_COLOR = "#333333";
const ACCENT_COLOR = "#074d8f";
const SUBTEXT_COLOR = "#666666";
const DIVIDER_COLOR = "#E5E7EB";

function createInfoCell(
  label: string,
  value: string | number | undefined,
  colSpan: number = 1,
): TableCell {
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
}

function createSectionTitle(title: string): Content {
  return {
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
  };
}

export function getActaDocDefinition(data: ActaData): TDocumentDefinitions {
  const shouldDisplayReceptor =
    data?.receptor?.nombre?.trim() !== "" && data?.receptor?.run !== "";

  const numeroEntrega = data?.numeroEntrega ?? undefined;
  const ordinalEntrega =
    typeof numeroEntrega === "number"
      ? ["Primera", "Segunda", "Tercera"][numeroEntrega - 1] ||
        `${numeroEntrega}ª`
      : undefined;

  return {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: { font: "Geist" },
    content: [
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
                  [createInfoCell("Domicilio", data.receptor.domicilio, 2), {}],
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
                          { text: d.value, color: SUBTEXT_COLOR, fontSize: 9 },
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

    footer: () => ({
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
    }),
  };
}
