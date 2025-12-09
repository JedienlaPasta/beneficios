import type {
  TDocumentDefinitions,
  //   Content,
  StyleDictionary,
  TableCell,
} from "pdfmake/interfaces";
import type { ActaData } from "../types";
import type {
  Content,
  ContentStack,
  ContentCanvas,
  Column,
} from "pdfmake/interfaces";

const PRIMARY_COLOR = "#333333";
const ACCENT_COLOR = "#074d8f";
const SUBTEXT_COLOR = "#757575";
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
          { text: `${label}: `, bold: true, color: "black", fontSize: 10.5 },
          { text: String(value), color: SUBTEXT_COLOR, fontSize: 10.5 },
        ],
        margin: [0, 2, 0, 4],
      },
    ],
    colSpan,
  };
}

// Reemplaza la barra por un rectángulo con bordes redondeados y texto superpuesto
function createSectionTitle(title: string): Content {
  return {
    stack: [
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 515, // ancho útil (595 - 2*40)
            h: 24, // alto de la barra
            r: 2.5, // radio del borde
            color: PRIMARY_COLOR,
          },
        ],
        margin: [0, 0, 0, 0],
      },
      {
        text: title,
        style: "sectionTitle",
        color: "white",
        // coloca el texto dentro del rectángulo y deja margen inferior para separar
        margin: [8, -19, 0, 10],
      },
    ],
  };
}

export function getActaDocDefinition(
  data: ActaData,
  assets?: { logoDataUrl: string | null },
): TDocumentDefinitions {
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
    pageMargins: [40, 30, 40, 40],
    defaultStyle: { font: "Geist" },
    content: [
      {
        columns: [
          {
            width: "*",
            stack: [
              {
                text: "ACTA DE ENTREGA",
                fontSize: 26,
                font: "GeistBlack",
                color: "#111",
                characterSpacing: 0.1,
              },
              {
                text: "AYUDA ASISTENCIAL MUNICIPAL",
                fontSize: 13,
                bold: true,
                color: ACCENT_COLOR,
                margin: [0, -5, 0, 0],
                characterSpacing: 0.5,
              },
              {
                text: [
                  {
                    text: `${data.profesional.fecha} `,
                    fontSize: 9.5,
                    color: SUBTEXT_COLOR,
                  },
                  {
                    text: "| El Quisco, Chile | ",
                    fontSize: 9.5,
                    color: SUBTEXT_COLOR,
                  },
                  ordinalEntrega
                    ? {
                        text: `Entrega: ${ordinalEntrega} del año`,
                        bold: true,
                        fontSize: 9.5,
                        color: SUBTEXT_COLOR,
                      }
                    : "",
                ] as Column[],
              },
              {
                text: `Folio: ${data.folio}`,
                fontSize: 11,
                bold: true,
                color: PRIMARY_COLOR,
                margin: [0, 4, 0, 8],
              },
            ],
          },
          {
            width: 80,
            stack: assets?.logoDataUrl
              ? [
                  {
                    image: assets.logoDataUrl,
                    fit: [28, 28],
                    alignment: "center",
                    margin: [0, 0, 0, 4],
                  },
                  {
                    text: ["Municipalidad", "\n", "El Quisco"],
                    fontSize: 8,
                    color: "#9CA3AF",
                    alignment: "center",
                    lineHeight: 1,
                  },
                ]
              : [
                  {
                    text: "Municipalidad El Quisco",
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
          //   hLineWidth: () => 0.5,
          //   hLineColor: () => DIVIDER_COLOR,
          hLineWidth: () => 0,
          vLineWidth: () => 0,
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
        margin: [4, 0, 4, 7],
      },

      ...(shouldDisplayReceptor && data.receptor
        ? [
            createSectionTitle("INFORMACIÓN DEL RECEPTOR"),
            {
              layout: {
                // hLineWidth: () => 0.5,
                // hLineColor: () => DIVIDER_COLOR,
                hLineWidth: () => 0,
                vLineWidth: () => 0,
              },
              table: {
                widths: ["65%", "35%"],
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
              margin: [4, 0, 4, 7],
            } as Content,
          ]
        : []),

      createSectionTitle("DETALLE DE LA ENTREGA"),
      {
        columnGap: 0,
        columns: [
          {
            width: "*",
            // Tipamos explícitamente el resultado del map como Content[]
            stack: data.beneficios.map((beneficio, index, arr) => {
              const items: Content[] = [
                {
                  columns: [
                    {
                      text: beneficio.nombre,
                      bold: true,
                      fontSize: 10.5,
                      color: PRIMARY_COLOR,
                    },
                    {
                      text: beneficio.codigo || "PA",
                      fontSize: 10,
                      color: "#9CA3AF",
                      alignment: "right",
                    },
                  ],
                },
                {
                  margin: [8, 4, 0, 8],
                  // Cada detalle es un ContentColumns, lo tipamos como Content[]
                  stack: beneficio.detalles.map((detalle) => ({
                    columns: [
                      {
                        text: "•",
                        width: 10,
                        color: ACCENT_COLOR,
                        fontSize: 10.5,
                      },
                      {
                        text: [
                          {
                            text: detalle.label ? `${detalle.label}: ` : "",
                            bold: true,
                            color: "#444",
                            fontSize: 10,
                          },
                          {
                            text: detalle.value,
                            color: SUBTEXT_COLOR,
                            fontSize: 10,
                          },
                        ],
                      },
                    ],
                    margin: [0, 0, 0, 2],
                  })) as Content[],
                } as ContentStack,
              ];

              // Agregamos el separador si NO es el último beneficio, tipado como ContentCanvas
              if (index < arr.length - 1) {
                const divider: ContentCanvas = {
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: 0,
                      x2: 500,
                      y2: 0,
                      lineWidth: 0.5,
                      lineColor: DIVIDER_COLOR,
                    },
                  ],
                };
                items.push(divider);
              }

              // Devolvemos un bloque (ContentStack) por beneficio con margen inferior
              return { margin: [0, 0, 0, 10], stack: items } as ContentStack;
            }) as Content[],
          },
        ],
        margin: [8.25, 5, 10, -8],
      },

      ...(data.justificacion
        ? [
            createSectionTitle("OBSERVACIONES / JUSTIFICACIÓN"),
            {
              text: data.justificacion,
              fontSize: 10.5,
              color: SUBTEXT_COLOR,
              alignment: "justify",
              lineHeight: 1.2,
              margin: [8.25, 1, 8.25, 40],
            } as Content,
          ]
        : []),

      //   {
      //     margin: [0, 40, 0, 0],
      //     columns: [
      //       {
      //         width: "*",
      //         stack: [
      //           {
      //             canvas: [
      //               {
      //                 type: "line",
      //                 x1: 0,
      //                 y1: 0,
      //                 x2: 220,
      //                 y2: 0,
      //                 lineWidth: 1,
      //                 lineColor: "#CCCCCC",
      //               },
      //             ],
      //             margin: [0, 0, 0, 5],
      //           },
      //           {
      //             text: data.profesional.nombre,
      //             fontSize: 9,
      //             bold: true,
      //             alignment: "center",
      //             color: PRIMARY_COLOR,
      //           },
      //           {
      //             text: data.profesional.cargo,
      //             fontSize: 8,
      //             alignment: "center",
      //             color: SUBTEXT_COLOR,
      //           },
      //         ],
      //         alignment: "center",
      //       },
      //       { width: 40, text: "" },
      //       {
      //         width: "*",
      //         stack: [
      //           {
      //             canvas: [
      //               {
      //                 type: "line",
      //                 x1: 0,
      //                 y1: 0,
      //                 x2: 220,
      //                 y2: 0,
      //                 lineWidth: 1,
      //                 lineColor: "#CCCCCC",
      //               },
      //             ],
      //             margin: [0, 0, 0, 5],
      //           },
      //           {
      //             text: data.receptor?.nombre || "Sin Receptor",
      //             fontSize: 9,
      //             bold: true,
      //             alignment: "center",
      //             color: PRIMARY_COLOR,
      //           },
      //           {
      //             text: "Firma de conformidad y recepción",
      //             fontSize: 8,
      //             alignment: "center",
      //             color: SUBTEXT_COLOR,
      //           },
      //         ],
      //         alignment: "center",
      //       },
      //     ],
      //   },
    ],

    styles: {
      sectionTitle: {
        fontSize: 11,
        bold: true,
        color: "white",
        margin: [4, 4, 4, 4] as [number, number, number, number],
        characterSpacing: 0.8,
      },
    } as StyleDictionary,

    footer: (currentPage: number, pageCount: number): Content => ({
      stack: [
        // Firmas solo en la última página
        ...(currentPage === pageCount
          ? [
              {
                margin: [0, 0, 0, 22] as [number, number, number, number],
                columns: [
                  {
                    width: "*",
                    stack: [
                      {
                        canvas: [
                          {
                            type: "line" as const,
                            x1: 0,
                            y1: 0,
                            x2: 220,
                            y2: 0,
                            lineWidth: 1,
                            lineColor: "#CCCCCC",
                          },
                        ],
                        margin: [0, 0, 0, 5] as [
                          number,
                          number,
                          number,
                          number,
                        ],
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
                    ] as Content[],
                    alignment: "center" as const,
                  },
                  { width: 40, text: "" },
                  {
                    width: "*",
                    stack: [
                      {
                        canvas: [
                          {
                            type: "line" as const,
                            x1: 0,
                            y1: 0,
                            x2: 220,
                            y2: 0,
                            lineWidth: 1,
                            lineColor: "#CCCCCC",
                          },
                        ],
                        margin: [0, 0, 0, 5] as [
                          number,
                          number,
                          number,
                          number,
                        ],
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
                    ] as Content[],
                    alignment: "center" as const,
                  },
                ],
              },
            ]
          : []),

        // Texto informativo centrado (en todas las páginas)
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
          margin: [0, 2, 0, 0] as [number, number, number, number],
        },
      ],
      // separa el footer del borde inferior del papel
      margin: [40, -56, 40, 20] as [number, number, number, number],
    }),
  };
}
