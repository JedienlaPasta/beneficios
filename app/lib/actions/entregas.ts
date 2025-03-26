"use server";

import postgres from "postgres";
import { z } from "zod";
import { PDFDocument } from "pdf-lib";

interface CitizenData {
  telefono: string | null;
  correo: string | null;
  nombres: string;
  apellidopaterno: string;
  apellidomaterno: string | null;
  apellidos: string;
  rut: string;
  dv: string;
  indigena: string | null;
  genero: string;
  nacionalidad: string | null;
  sector: string | null;
  calle: string;
  numcalle: string | null;
  direccion: string;
  tramo: string;
  folio: string;
  fecha_nacimiento: Date | null;
  fecha_encuesta: Date | null;
  fecha_modificacion: Date | null;
  fecha_calificacion: Date | null;
}

interface UserData {
  nombre: string;
  cargo: string;
  rol: string;
  correo: string;
  id: string;
  contraseña: string;
}

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Crear Entrega
const CreateEntregaFormSchema = z.object({
  id_usuario: z.string(),
  rut: z.string(),
  observaciones: z.string(),
  campaigns: z.array(
    z.object({
      //campaign_id
      id: z.string(),
      campaignName: z.string(),
      detail: z.string(),
      code: z.string(),
    }),
  ),
});

const CreateEntrega = CreateEntregaFormSchema;

export const createEntrega = async (id: string, formData: FormData) => {
  try {
    const { rut, observaciones, campaigns, id_usuario } = CreateEntrega.parse({
      rut: formData.get("rut"),
      observaciones: formData.get("observaciones"),
      campaigns: JSON.parse(formData.get("campaigns") as string),
      id_usuario: formData.get("id_usuario"),
    });

    let code;
    if (campaigns.length === 0)
      throw new Error("No se seleccionó ninguna campaña");
    if (campaigns.length > 1) code = "DO";
    else code = campaigns[0].code;

    let folio: string = "";

    await sql.begin(async (sql) => {
      const entrega = await sql`
        INSERT INTO entregas (folio, observacion, rut, id_usuario)
        VALUES (
            concat(
                substring(replace(uuid_generate_v4()::text, '-', '') from 1 for 8), 
                '-', 
                to_char(current_date, 'YY'), 
                '-', 
                ${code}::TEXT
            ),
            ${observaciones},
            ${rut},
            ${id}
        )
        RETURNING folio
      `;

      folio = entrega[0].folio;

      // Se ingresa cada entrega en la tabla Entrega, y se actualiza la cantidad de entregas en la tabla Campañas
      if (campaigns.length > 0) {
        await Promise.all(
          campaigns.flatMap((campaign) => [
            sql`
              INSERT INTO entrega (detalle, folio, id_campaña)
              VALUES (${campaign.detail}, ${folio}, ${campaign.id})
            `,
            sql`
              UPDATE campañas SET entregas = entregas + 1 WHERE id = ${campaign.id}
            `,
          ]),
        );
      }
    });

    // Generación documento
    // const pdfPath = "/var/task/public/ActaEntrega.pdf";  ./ActaEntrega
    // const pdfUrl =
    //   "https://raw.githubusercontent.com/JedienlaPasta/files/main/ActaEntrega.pdf";
    // const response = await fetch(pdfUrl);
    // const pdfBytes = await response.arrayBuffer();
    // const pdfDoc = await PDFDocument.load(pdfBytes);
    // // const pdfBytes = fs.readFileSync(pdfPath);

    // // Obtención de datos

    // // Ciudadano
    // const ciudadanofila = await sql`select * from rsh where rut = ${rut}`;
    // if (ciudadanofila.length === 0) {
    //   return { success: false, error: "Persona no encontrada", status: 404 };
    // }
    // const ciudadano = ciudadanofila[0] as CitizenData;
    // if (!ciudadano) {
    //   return { success: false, error: "Persona no encontrada", status: 404 };
    // }

    // // Fecha actual
    // const fecha = new Date();

    // // Encargado
    // const encargadofila =
    //   await sql`select * from usuarios where id = ${id_usuario}`;
    // if (encargadofila.length === 0) {
    //   return { success: false, error: "Empleado no encontrado", status: 404 };
    // }
    // const encargado = encargadofila[0] as UserData;
    // if (!encargado) {
    //   return { success: false, error: "Empleado no encontrado", status: 404 };
    // }

    // // Asignación de valores a los campos del formulario
    // const form = pdfDoc.getForm();

    // form.getTextField("Folio").setText(String(folio));

    // form
    //   .getTextField("NombreCiudadano")
    //   .setText(String(ciudadano.nombres + " " + ciudadano.apellidos));
    // form
    //   .getTextField("Rut")
    //   .setText(String(ciudadano.rut + "-" + ciudadano.dv));
    // form.getTextField("Domicilio").setText(String(ciudadano.direccion));
    // form.getTextField("Tramo").setText(String(ciudadano.tramo + "%"));
    // form
    //   .getTextField("Telefono")
    //   .setText(String(ciudadano.telefono ? ciudadano.telefono : "No aplica"));
    // form
    //   .getTextField("FechaSolicitud")
    //   .setText(String(fecha.toLocaleDateString()));

    // campaigns.forEach((campaign) => {
    //   const { campaignName, detail } = campaign;

    //   if (campaignName.includes("Vale de Gas")) {
    //     form.getTextField("CodigoGas").setText(String(detail));
    //   } else if (campaignName.includes("Pañales")) {
    //     const pañalTypes = ["RN", "G", "XXG", "P", "XG", "Adultos"];
    //     pañalTypes.forEach((tipo) => {
    //       if (detail.includes(tipo)) {
    //         form.getTextField(tipo).setText("X");
    //       }
    //     });
    //   } else if (campaignName.includes("Tarjeta de Comida")) {
    //     form.getTextField("CodigoTarjeta").setText(String(detail));
    //   } else {
    //     form.getTextField("Otros").setText(String(detail));
    //   }
    // });

    // form.getTextField("Justificacion").setText(String(observaciones));
    // form.getTextField("NombreProfesional").setText(String(encargado.nombre));
    // form.getTextField("Cargo").setText(String(encargado.cargo));
    // form
    //   .getTextField("FechaEntrega")
    //   .setText(String(fecha.toLocaleDateString()));

    // // Almacenamiento de documento generado
    // const pdfBytesFilled = await pdfDoc.save();

    // // 1. Convert the PDF to a Base64 string so we can store it in a TEXT column
    // const pdfBase64 = Buffer.from(pdfBytesFilled).toString("base64");

    // // Opcional: Almacenado localmente
    // // const outputPath = path.join(
    // //   process.cwd(),
    // //   "public",
    // //   `Acta de entrega inicial.pdf`,
    // // );
    // // fs.writeFileSync(outputPath, pdfBytesFilled);

    // // 2. Insert into la tabla "documentos"
    // await sql`
    //   INSERT INTO documentos (
    //     nombre_documento,
    //     archivo,
    //     tipo,
    //     folio
    //   )
    //   VALUES (
    //     ${"Acta de entrega inicial"},
    //     ${pdfBase64},
    //     ${".pdf"},
    //     ${folio}
    //   )
    //   `;

    return { success: true, message: "Entrega recibida" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

// Editar Entrega

// Subir actas de cada entrega
export const uploadPDFByFolio = async (folio: string, formData: FormData) => {
  try {
    const fileCount = Number(formData.get("fileCount") || "0");

    if (fileCount === 0) {
      return {
        success: false,
        message: "No se han seleccionado documentos",
      };
    }

    const uploadPromises = [];

    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file${i}`) as File;

      if (!file) continue;

      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);
      const fileBase64 = fileBuffer.toString("base64");

      const fileName = file.name;
      const fileType = ".pdf";
      const fecha = new Date();
      fecha.setMilliseconds(fecha.getMilliseconds() + i);

      const insertPromise = sql`
        INSERT INTO documentos (
          fecha_guardado,
          nombre_documento,
          archivo,
          tipo,
          folio
        )
        VALUES (
          ${fecha},
          ${fileName},
          ${fileBase64},
          ${fileType},
          ${folio}
        )
      `;

      uploadPromises.push(insertPromise);
    }

    // Primero se insertan los documentos en la tabla "documentos"
    await Promise.all(uploadPromises);

    // Luego se actualiza el estado de la entrega en la tabla "entregas" de acuerdo a la cantidad de documentos
    await sql.begin(async (tx) => {
      const [{ count }] = await tx`
        SELECT COUNT(*)::int AS count
        FROM documentos
        WHERE folio = ${folio}
      `;

      if (count === 3) {
        await tx`
          UPDATE Entregas
          SET estado_documentos = 'Finalizado'
          WHERE folio = ${folio}
        `;
      } else {
        await tx`
          UPDATE Entregas
          SET estado_documentos = 'En Curso'
          WHERE folio = ${folio}
        `;
      }
    });

    return {
      success: true,
      message: `${fileCount} documento(s) guardado(s) correctamente`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

// eliminar documento mediante id
export const deletePDFById = async (id: string) => {
  try {
    // Check if document exists before deleting
    const document = await sql`
      SELECT id, folio FROM documentos
      WHERE id = ${id}
    `;

    if (document.length === 0) {
      return {
        success: false,
        message: "Documento no encontrado",
      };
    }

    await sql.begin(async (sql) => {
      await sql`
        DELETE FROM documentos
        WHERE id = ${id}
      `;

      await sql`
        UPDATE Entregas
        SET estado_documentos = 'En Curso'
        WHERE folio = ${document[0].folio}
      `;
    });

    return {
      success: true,
      message: "Documento eliminado correctamente",
    };
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

// Descargar documento mediante id
export const downloadPDFById = async (id: string) => {
  try {
    // Fetch document from database
    const document = await sql`
      SELECT archivo, nombre_documento
      FROM documentos
      WHERE id = ${id}
    `;

    if (document.length === 0) {
      return {
        success: false,
        message: "Documento no encontrado",
      };
    }

    // Get base64 string and document name
    const { archivo, nombre_documento } = document[0];

    return {
      success: true,
      data: {
        content: archivo,
        filename: nombre_documento || "documento.pdf",
      },
    };
  } catch (error) {
    console.error("Error al descargar documento:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

type Entregas = {
  folio: string;
  observacion: string;
  rut: string;
  id_usuario: string;
};

export const createAndDownloadPDFByFolio = async (folio: string) => {
  try {
    const entregaInfo = await sql<Entregas[]>`
      SELECT observacion, rut, id_usuario
      FROM entregas WHERE folio = ${folio}
    `;

    if (entregaInfo.length === 0) {
      return { success: false, error: "Entrega no encontrada", status: 404 };
    }
    console.log(entregaInfo);

    const campaigns = await sql<{ campaign_name: string; detail: string }[]>`
      SELECT campañas.nombre as campaign_name, entrega.detalle as detail
      FROM entrega 
      JOIN campañas ON campañas.id = entrega.id_campaña
      WHERE folio = ${folio} 
    `;

    if (campaigns.length === 0) {
      return { success: false, error: "Campañas no encontradas", status: 404 };
    }
    console.log(campaigns);

    const { observacion, rut, id_usuario } = entregaInfo[0];
    // Generar Acta de Entrega
    const pdfUrl =
      "https://raw.githubusercontent.com/JedienlaPasta/files/main/ActaEntrega.pdf";
    const response = await fetch(pdfUrl);
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Datos del Ciudadano
    const ciudadanofila = await sql`select * from rsh where rut = ${rut}`;
    if (ciudadanofila.length === 0) {
      return { success: false, error: "Persona no encontrada", status: 404 };
    }
    const ciudadano = ciudadanofila[0] as CitizenData;

    // Encargado
    const encargadofila =
      await sql`select * from usuarios where id = ${id_usuario}`;
    if (encargadofila.length === 0) {
      return { success: false, error: "Empleado no encontrado", status: 404 };
    }
    const encargado = encargadofila[0] as UserData;

    // Asignación de valores a los campos del formulario
    const form = pdfDoc.getForm();

    form.getTextField("Folio").setText(String(folio));
    form
      .getTextField("NombreCiudadano")
      .setText(String(ciudadano.nombres + " " + ciudadano.apellidos));
    form
      .getTextField("Rut")
      .setText(String(ciudadano.rut + "-" + ciudadano.dv));
    form.getTextField("Domicilio").setText(String(ciudadano.direccion));
    form.getTextField("Tramo").setText(String(ciudadano.tramo + "%"));
    form
      .getTextField("Telefono")
      .setText(String(ciudadano.telefono ? ciudadano.telefono : "No aplica"));

    const fecha = new Date(); // Fecha actual
    form
      .getTextField("FechaSolicitud")
      .setText(String(fecha.toLocaleDateString()));

    campaigns.forEach((campaign) => {
      const { campaign_name, detail } = campaign;

      if (campaign_name.includes("Vale de Gas")) {
        form.getTextField("CodigoGas").setText(String(detail));
      } else if (campaign_name.includes("Pañales")) {
        const pañalTypes = ["RN", "G", "XXG", "P", "XG", "Adultos"];
        pañalTypes.forEach((tipo) => {
          if (detail.includes(tipo)) {
            form.getTextField(tipo).setText("X");
          }
        });
      } else if (campaign_name.includes("Tarjeta de Comida")) {
        form.getTextField("CodigoTarjeta").setText(String(detail));
      } else {
        form.getTextField("Otros").setText(String(detail));
      }
    });

    form.getTextField("Justificacion").setText(String(observacion));
    form.getTextField("NombreProfesional").setText(String(encargado.nombre));
    form.getTextField("Cargo").setText(String(encargado.cargo));
    form
      .getTextField("FechaEntrega")
      .setText(String(fecha.toLocaleDateString()));

    // Almacenamiento de documento generado
    const pdfBytesFilled = await pdfDoc.save();

    return {
      success: true,
      data: {
        content: pdfBytesFilled,
        filename: "Acta de entrega inicial.pdf",
      },
    };
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
