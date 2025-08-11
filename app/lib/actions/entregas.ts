"use server";
import sql, { MSSQLError } from "mssql";
import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import { compressPdfBuffer } from "../utils/pdf-compress";
import { connectToDB } from "../utils/db-connection";
import { logAction } from "./auditoria";
import { formatDate, formatPhone, formatRUT } from "../utils/format";

interface CitizenData {
  telefono: string | null;
  correo: string | null;
  nombres_rsh: string;
  apellidopaterno: string;
  apellidomaterno: string | null;
  apellidos_rsh: string;
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
  direccion_mod?: string;
  telefono_mod?: string;
}

interface UserData {
  nombre_usuario: string;
  cargo: string;
  rol: string;
  correo: string;
  id: string;
  contraseña: string;
}

// Crear Entrega
const CreateEntregaFormSchema = z.object({
  rut: z.string().min(1, { message: "RUT es requerido" }),
  observaciones: z.string().optional(),
  campaigns: z.string(
    z.object({
      id: z.string(),
      campaignName: z.string(),
      detail: z.string(),
      code: z.string().length(2),
    }),
  ),
  folio: z
    .string()
    .min(7, { message: "Folio debe tener al menos 7 caracteres" })
    .optional(),
  fecha_entrega: z.string().optional(),
  correo: z.string().email({ message: "Correo no válido" }).optional(),
});

const CreateEntrega = CreateEntregaFormSchema;

export const createEntrega = async (id: string, formData: FormData) => {
  const result = CreateEntrega.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }
  const rut = formData.get("rut");
  const folio = formData.get("folio");
  const correo = formData.get("correo");
  const observaciones = formData.get("observaciones");
  const fecha_entrega = formData.get("fecha_entrega");
  const campaigns = JSON.parse(formData.get("campaigns") as string);

  if (!rut || campaigns.length === 0) {
    return {
      success: false,
      message: "Campos incompletos",
    };
  }

  let code;
  if (campaigns.length > 1) code = "DO";
  else code = campaigns[0].code;

  let newFolio: string = "";

  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    let transaction: sql.Transaction | undefined;
    try {
      transaction = new sql.Transaction(pool);
      await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

      let userId: string;

      if (correo) {
        const correoRequest = new sql.Request(transaction);
        const correoResult = await correoRequest.input(
          "correo",
          sql.VarChar,
          correo,
        ).query(`
          SELECT id FROM usuarios WHERE correo = @correo
        `);
        if (correoResult.recordset.length === 0) {
          return {
            success: false,
            message: "Correo no registrado",
          };
        }
        userId = correoResult.recordset[0].id;
      } else {
        userId = id;
      }

      // Use provided folio or generate a new one
      if (folio) {
        // Manual insert path
        const checkFolioRequest = new sql.Request(transaction);
        const checkFolioResult = await checkFolioRequest.input(
          "folio",
          sql.VarChar,
          String(folio).trim(),
        ).query(`
          SELECT folio FROM entregas WHERE folio = @folio
        `);
        if (checkFolioResult.recordset.length > 0) {
          await transaction.rollback();
          return {
            success: false,
            message: "Este Folio ya se encuentra registrado",
          };
        }

        let fechaEntregaConHora;
        if (fecha_entrega) {
          const fecha = new Date(fecha_entrega as string);
          fecha.setHours(12, 0, 0, 0);
          fechaEntregaConHora = fecha;
        } else {
          const hoy = new Date();
          hoy.setHours(12, 0, 0, 0);
          fechaEntregaConHora = hoy;
        }

        const upperCaseFolio = String(folio).toUpperCase().trim();

        const entregaRequest = new sql.Request(transaction);
        await entregaRequest
          .input("folio", sql.VarChar, upperCaseFolio)
          .input("observacion", sql.VarChar, String(observaciones).trim())
          .input("fecha_entrega", sql.DateTime, fechaEntregaConHora)
          .input("rut", sql.Int, rut)
          .input("id_usuario", sql.UniqueIdentifier, userId).query(`
            INSERT INTO entregas (folio, observacion, fecha_entrega, rut, id_usuario)
            VALUES (
              @folio,
              @observacion,
              @fecha_entrega,
              @rut,
              @id_usuario
            )
          `);

        newFolio = folio ? folio.toString().trim() : "";
      } else {
        // Generate a folio using MSSQL functions (auto)
        const currentYearFull = new Date().getFullYear();
        const currentYearTwoDigits = currentYearFull % 100;

        const spRequest = new sql.Request(transaction);
        spRequest.input("p_rut", sql.Int, rut);
        spRequest.input(
          "p_observacion",
          sql.NVarChar,
          String(observaciones).trim(),
        );
        spRequest.input("p_id_usuario", sql.UniqueIdentifier, userId);
        spRequest.input("p_current_year", sql.Int, currentYearTwoDigits);
        spRequest.input("p_code", sql.VarChar, String(code).trim());
        spRequest.output("p_new_folio_output", sql.VarChar);

        const spResult = await spRequest.execute(
          "dbo.GenerateAndInsertEntrega",
        );
        newFolio = spResult.output.p_new_folio_output;

        if (!newFolio) {
          throw new Error("No se pudo generar el folio automáticamente");
        }
      }

      // Insert campaign details and update campaign counts
      if (campaigns.length > 0) {
        for (const campaign of campaigns) {
          const detail =
            typeof campaign.detail === "string"
              ? campaign.detail.toUpperCase().trim()
              : String(campaign.detail).trim();

          // Insert into entrega
          const insertEntregaCampaignRequest = new sql.Request(transaction);
          await insertEntregaCampaignRequest
            .input("detail", sql.VarChar, detail)
            .input("folio", sql.VarChar, newFolio)
            .input("campaignId", sql.UniqueIdentifier, campaign.id).query(`
              INSERT INTO entrega (detalle, folio, id_campaña)
              VALUES (@detail, @folio, @campaignId)
            `);

          const updateCampaignRequest = new sql.Request(transaction);
          await updateCampaignRequest.input(
            "campaignId",
            sql.UniqueIdentifier,
            campaign.id,
          ).query(`
              UPDATE campañas 
              SET entregas = ISNULL(entregas, 0) + 1
              WHERE id = @campaignId
            `);
        }
      }

      // Commit the transaction
      await transaction.commit();
      console.log("Transaction committed successfully.");
      await logAction("Crear", "registró una nueva entrega", "", newFolio);
      return { success: true, message: "Entrega recibida" };
    } catch (error) {
      if (transaction) {
        await transaction.rollback();
        console.error("Transaction rolled back due to error.");
      }
      console.error("Transaction error details:", error);

      // Define the expected error structure
      interface SQLServerError {
        originalError: {
          info: {
            number: number;
          };
        };
      }

      // Type guard function - completely type-safe without any 'any' types
      function isSQLServerError(error: unknown): error is SQLServerError {
        return (
          error !== null &&
          typeof error === "object" &&
          "originalError" in error &&
          error.originalError !== null &&
          typeof error.originalError === "object" &&
          "info" in error.originalError &&
          error.originalError.info !== null &&
          typeof error.originalError.info === "object" &&
          "number" in error.originalError.info &&
          typeof error.originalError.info.number === "number"
        );
      }

      // Then use it in your error handling:
      if (error instanceof MSSQLError) {
        if (
          isSQLServerError(error) &&
          error.originalError.info.number === 1205
        ) {
          // Deadlock victim error
          return {
            success: false,
            message:
              "Error de concurrencia: Se detectó un conflicto. Por favor, inténtelo de nuevo.",
          };
        }
        return {
          success: false,
          message: `Error en la base de datos: ${error.message}`,
        };
      }
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return {
      success: false,
      message: "No se pudo conectar a la base de datos.",
    };
  }
};

// Editar Entrega ================================================================================= (pendiente)

export const deleteEntregaByFolio = async (folio: string) => {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    const transaction: sql.Transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      // Check if entrega exists
      const folioRequest = new sql.Request(transaction);
      const folioResult = await folioRequest.input("folio", sql.NVarChar, folio)
        .query(`
        SELECT folio, estado_documentos FROM entregas WHERE folio = @folio
      `);

      if (folioResult.recordset.length === 0) {
        return { success: false, message: "Entrega no encontrada" };
      }

      console.log(folioResult.recordset[0].estado_documentos);
      if (folioResult.recordset[0].estado_documentos !== "En Curso") {
        return {
          success: false,
          message:
            "Solo se pueden eliminar las entregas con estado 'En Curso'.",
        };
      }

      const next_folio_num = Number(folio.split("-")[0]) + 1;
      const nextFolioRequest = new sql.Request(transaction);
      const nextFolioResult = await nextFolioRequest.input(
        "folio_num",
        sql.Int,
        next_folio_num,
      ).query(`
        SELECT folio_num FROM entregas WHERE folio_num = @folio_num
      `);

      if (nextFolioResult.recordset.length > 0) {
        return {
          success: false,
          message:
            "Ya no se puede eliminar esta entrega. Existe una entrega posterior.",
        };
      }

      // Get campaign IDs to update campaign counts
      const campaignRequest = new sql.Request(transaction);
      const campaignResult = await campaignRequest.input(
        "folio",
        sql.NVarChar,
        folio,
      ).query(`
        SELECT id_campaña FROM entrega WHERE folio = @folio
      `);

      // Update campaign counts
      for (const campaign of campaignResult.recordset) {
        const updateRequest = new sql.Request(transaction);
        await updateRequest.input(
          "campaignId",
          sql.UniqueIdentifier,
          campaign.id_campaña,
        ).query(`
          UPDATE campañas
          SET entregas = entregas - 1
          WHERE id = @campaignId AND entregas > 0
        `);
      }

      // Delete the entrega record (this will cascade to entrega and documentos if set up)
      const deleteRequest = new sql.Request(transaction);
      await deleteRequest.input("folio", sql.NVarChar, folio).query(`
        DELETE FROM entregas WHERE folio = @folio
      `);

      await transaction.commit();
      await logAction("Eliminar", "eliminó la entrega", "", folio);
      return { success: true, message: "Entregas eliminadas correctamente" };
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al eliminar entregas:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

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

    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    // Check current document count before uploading
    const countRequest = pool.request().input("folio", sql.NVarChar, folio);
    const countResult = await countRequest.query(`
      SELECT COUNT(*) AS count
      FROM documentos
      WHERE folio = @folio
    `);

    const currentCount = countResult.recordset[0].count as number;

    // After getting currentCount
    if (currentCount >= 4) {
      return {
        success: false,
        message: "Ya has alcanzado el máximo de 4 documentos permitidos.",
      };
    }

    // Prevent upload if total would exceed 4 documents
    if (currentCount + fileCount > 4) {
      return {
        success: false,
        message: `No se pueden subir ${fileCount} documento(s). Hay ${currentCount} documento(s) y el máximo permitido es 4.`,
      };
    }

    const uploadPromises = [];

    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file${i}`) as File;
      console.log(file);

      if (!file) continue;

      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);
      const compressedBuffer = await compressPdfBuffer(fileBuffer);
      // Acrchivo que se ingresa
      const fileBase64 = compressedBuffer.toString("base64");

      const fileName = file.name;
      const fileType = ".pdf";
      const fecha = new Date();
      fecha.setMilliseconds(fecha.getMilliseconds() + i);

      const insertPromise = pool
        .request()
        .input("fecha", sql.DateTime, fecha)
        .input("fileName", sql.NVarChar, fileName)
        .input("fileBase64", sql.NVarChar, fileBase64)
        .input("fileType", sql.NVarChar, fileType)
        .input("folio", sql.NVarChar, folio).query(`
        INSERT INTO documentos (
          fecha_guardado,
          nombre_documento,
          archivo,
          tipo,
          folio
        )
        VALUES (
          @fecha,
          @fileName,
          @fileBase64,
          @fileType,
          @folio
        )
      `);

      uploadPromises.push(insertPromise);
    }

    // Primero se insertan los documentos en la tabla "documentos"
    await Promise.all(uploadPromises);

    // Luego se actualiza el estado de la entrega en la tabla "entregas" de acuerdo a la cantidad de documentos
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      const count = currentCount + fileCount;

      // Update status
      const updateRequest = new sql.Request(transaction);
      await updateRequest
        .input("folio", sql.VarChar, folio)
        .input("estado", sql.VarChar, count === 4 ? "Finalizado" : "En Curso")
        .query(`
        UPDATE entregas
        SET estado_documentos = @estado
        WHERE folio = @folio
      `);

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }

    await logAction("Subir", `subió ${fileCount} documento(s)`, "PDF", folio);
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
export const deletePDFById = async (id: string, folio: string) => {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    const folioRequest = pool.request().input("folio", sql.NVarChar, folio);
    const folioResult = await folioRequest.query(`
    SELECT estado_documentos FROM entregas
    WHERE folio = @folio
  `);

    if (folioResult.recordset.length === 0) {
      return {
        success: false,
        message: "Folio no encontrado",
      };
    }

    const estado = folioResult.recordset[0].estado_documentos;
    if (estado === "Finalizado") {
      return {
        success: false,
        message: "No se puede eliminar un documento de una entrega finalizada.",
      };
    }

    // Check if document exists before deleting
    const documentRequest = pool.request().input("id", sql.NVarChar, id);
    const documentResult = await documentRequest.query(`
    SELECT id FROM documentos
    WHERE id = @id
  `);

    if (documentResult.recordset.length === 0) {
      return {
        success: false,
        message: "Documento no encontrado",
      };
    }

    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      // Delete document
      const deleteRequest = new sql.Request(transaction).input(
        "id",
        sql.NVarChar,
        id,
      );
      await deleteRequest.query(`
      DELETE FROM documentos
      WHERE id = @id
    `);

      // Update entregas status
      const updateRequest = new sql.Request(transaction).input(
        "folio",
        sql.NVarChar,
        folio,
      );
      await updateRequest.query(`
      UPDATE entregas
      SET estado_documentos = 'En Curso'
      WHERE folio = @folio
    `);

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }

    await logAction("Eliminar", "eliminó 1 documento", "PDF", folio);
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
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    // Fetch document from database
    const documentRequest = pool.request().input("id", sql.NVarChar, id);
    const documentResult = await documentRequest.query(`
    SELECT archivo, nombre_documento, folio
    FROM documentos
    WHERE id = @id
  `);

    if (documentResult.recordset.length === 0) {
      return {
        success: false,
        message: "Documento no encontrado",
      };
    }

    // Get base64 string and document name
    const { archivo, nombre_documento } = documentResult.recordset[0];

    await logAction(
      "Descargar",
      "descargó 1 documento",
      "PDF",
      documentResult.recordset[0].folio,
    );
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

export const createAndDownloadPDFByFolio = async (folio: string) => {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    // Get delivery info
    const entregaRequest = pool.request().input("folio", sql.NVarChar, folio);
    const entregaResult = await entregaRequest.query(`
    SELECT observacion, rut, id_usuario, fecha_entrega
    FROM entregas 
    WHERE folio = @folio
  `);

    if (entregaResult.recordset.length === 0) {
      return { success: false, error: "Entrega no encontrada", status: 404 };
    }

    // Get campaigns
    const campaignsRequest = pool.request().input("folio", sql.NVarChar, folio);
    const campaignsResult = await campaignsRequest.query(`
    SELECT campañas.nombre_campaña as campaign_name, entrega.detalle as detail
    FROM entrega 
    JOIN campañas ON campañas.id = entrega.id_campaña
    WHERE folio = @folio
  `);

    if (campaignsResult.recordset.length === 0) {
      return { success: false, error: "Campañas no encontradas", status: 404 };
    }

    const { observacion, rut, id_usuario, fecha_entrega } =
      entregaResult.recordset[0];
    const campaigns = campaignsResult.recordset;

    const pdfBytes = fs.readFileSync(
      path.join(process.cwd(), "public", "ActaEntrega.pdf"),
    );
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get citizen info
    const ciudadanoRequest = pool.request().input("rut", sql.Int, rut);
    const ciudadanoResult = await ciudadanoRequest.query(`
      SELECT * FROM rsh WHERE rut = @rut
    `);

    if (ciudadanoResult.recordset.length === 0) {
      return { success: false, error: "Persona no encontrada", status: 404 };
    }

    let ciudadano = ciudadanoResult.recordset[0] as CitizenData;

    // Get rsh_mod info
    const rshModRequest = pool.request().input("rut", sql.Int, rut);
    const rshModResult = await rshModRequest.query(`
      SELECT direccion_mod, telefono_mod FROM rsh_mods WHERE rut = @rut
    `);

    ciudadano = {
      ...ciudadano,
      ...rshModResult.recordset[0],
    };

    console.log(ciudadano);

    // Get employee info
    const encargadoRequest = pool
      .request()
      .input("id", sql.NVarChar, id_usuario);
    const encargadoResult = await encargadoRequest.query(`
      SELECT * FROM usuarios WHERE id = @id
    `);

    if (encargadoResult.recordset.length === 0) {
      return { success: false, error: "Empleado no encontrado", status: 404 };
    }

    const encargado = encargadoResult.recordset[0] as UserData;
    const nombreCompleto = `${ciudadano.nombres_rsh} ${ciudadano.apellidos_rsh}`;

    const form = pdfDoc.getForm();
    form.getTextField("Folio").setText(String(folio));
    form.getTextField("NombreCiudadano").setText(` ${nombreCompleto}`);
    form
      .getTextField("Rut")
      .setText(` ${formatRUT(ciudadano.rut, ciudadano.dv)}`);
    form
      .getTextField("Domicilio")
      .setText(" " + String(ciudadano.direccion_mod || ciudadano.direccion));
    form.getTextField("Tramo").setText(` ${ciudadano.tramo}%`);
    form
      .getTextField("Telefono")
      .setText(
        ciudadano.telefono_mod || ciudadano.telefono
          ? " " +
              formatPhone(String(ciudadano.telefono_mod || ciudadano.telefono))
          : " No registrado",
      );
    form
      .getTextField("FechaSolicitud")
      .setText(" " + formatDate(fecha_entrega, "fullDate"));

    campaigns.forEach(({ campaign_name, detail }) => {
      if (campaign_name.includes("Vale de Gas")) {
        form.getTextField("CodigoGas").setText(detail);
      } else if (campaign_name.includes("Pañales")) {
        ["RN", "G", "XXG", "P", "XG", "Adultos"].forEach((tipo) => {
          if (detail === tipo) form.getTextField(tipo).setText("X");
        });
      } else if (campaign_name.includes("Tarjeta de Comida")) {
        form.getTextField("CodigoTarjeta").setText(detail);
      } else {
        form.getTextField("Otros").setText(detail);
      }
    });

    form.getTextField("Justificacion").setText(observacion);
    form
      .getTextField("NombreProfesional")
      .setText(" " + encargado.nombre_usuario);
    form.getTextField("Cargo").setText(" " + encargado.cargo);
    form
      .getTextField("FechaEntrega")
      .setText(" " + formatDate(fecha_entrega, "fullDate"));

    // Guardar el PDF en un Buffer
    const pdfBuffer = await pdfDoc.save();

    let finalBuffer;
    try {
      // Comprimir PDF con Ghostscript
      finalBuffer = await compressPdfBuffer(Buffer.from(pdfBuffer));
    } catch (error) {
      console.error("Compression failed, using original PDF:", error);
      finalBuffer = pdfBuffer;
    }

    await logAction("Crear", "generó nueva acta de entrega", "PDF", folio);
    return {
      success: true,
      data: {
        content: finalBuffer.toString("base64"),
        filename: `ActaEntrega_${folio}.pdf`,
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

export const toggleEntregaStatus = async (folio: string, newStatus: string) => {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    const request = pool.request();
    const result = await request
      .input("folio", sql.NVarChar, folio)
      .input("estado", sql.NVarChar, newStatus).query(`
      UPDATE entregas
      SET estado_documentos = @estado
      WHERE folio = @folio
    `);
    if (result.rowsAffected[0] === 0) {
      return {
        success: false,
        message: "Entrega no encontrada",
      };
    }
    return {
      success: true,
      message: "Estado actualizado",
    };
  } catch (error) {
    console.error("Error al actualizar el estado de la entrega:", error);
    return {
      success: false,
      message: "Error al cambiar el estado de la entrega",
    };
  }
};
