"use server";
import sql from "mssql";
import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import { compressPdfBuffer } from "../utils/pdf-compress";
import { connectToDB } from "../utils/db-connection";

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
  rut: z.string(),
  observaciones: z.string(),
  campaigns: z.array(
    z.object({
      id: z.string(),
      campaignName: z.string(),
      detail: z.string(),
      code: z.string(),
    }),
  ),
});

const CreateEntrega = CreateEntregaFormSchema;

// Listo
export const createEntrega = async (id: string, formData: FormData) => {
  console.log(id);
  try {
    console.log("Starting createEntrega function");
    const { rut, observaciones, campaigns } = CreateEntrega.parse({
      rut: formData.get("rut"),
      observaciones: formData.get("observaciones"),
      campaigns: JSON.parse(formData.get("campaigns") as string),
    });
    console.log("Parsed form data:", {
      rut,
      observaciones,
      campaignsCount: campaigns.length,
    });

    let code;
    if (campaigns.length === 0)
      throw new Error("No se seleccionó ninguna campaña");
    if (campaigns.length > 1) code = "DO";
    else code = campaigns[0].code;

    let folio: string = "";

    const pool = await connectToDB();
    let transaction: sql.Transaction | undefined;
    try {
      transaction = new sql.Transaction(pool);
      await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);

      // Generate a folio using MSSQL functions
      const folioRequest = new sql.Request(transaction);
      folioRequest
        .input("observaciones", sql.NVarChar, observaciones)
        .input("rut", sql.Int, rut)
        .input("id", sql.UniqueIdentifier, id)
        .input("code", sql.NVarChar, code);

      const folioResult = await folioRequest.query(`
          DECLARE @UUID UNIQUEIDENTIFIER = NEWID();
          DECLARE @UUIDString NVARCHAR(50) = REPLACE(CAST(@UUID AS NVARCHAR(50)), '-', '');
          DECLARE @ShortUUID NVARCHAR(8) = SUBSTRING(@UUIDString, 1, 8);
          DECLARE @YearCode NVARCHAR(2) = RIGHT(CAST(YEAR(GETDATE()) AS NVARCHAR(4)), 2);
          DECLARE @NewFolio NVARCHAR(50) = CONCAT(@ShortUUID, '-', @YearCode, '-', @code);
          
          INSERT INTO entregas (folio, observacion, fecha_entrega, rut, id_usuario)
          OUTPUT INSERTED.folio
          VALUES (
            @NewFolio,
            @observaciones,
            GETUTCDATE(),
            @rut,
            @id
          )
      `);

      // Check if there was an error message returned
      if (
        folioResult.recordset &&
        folioResult.recordset[0] &&
        folioResult.recordset[0].error_message
      ) {
        throw new Error(folioResult.recordset[0].error_message);
      }

      // Check if we got a folio back
      if (!folioResult.recordset || folioResult.recordset.length === 0) {
        throw new Error("No se pudo generar el folio");
      }

      folio = folioResult.recordset[0].folio;
      console.log("Generated folio:", folio);

      // Insert campaign details and update campaign counts
      if (campaigns.length > 0) {
        for (const campaign of campaigns) {
          const campaignRequest = new sql.Request(transaction);
          await campaignRequest
            .input("detail", sql.NVarChar, campaign.detail)
            .input("folio", sql.NVarChar, folio)
            .input("campaignId", sql.UniqueIdentifier, campaign.id).query(`
              INSERT INTO entrega (detalle, folio, id_campaña)
              VALUES (@detail, @folio, @campaignId)
            `);

          const updateRequest = new sql.Request(transaction);
          await updateRequest.input(
            "campaignId",
            sql.UniqueIdentifier,
            campaign.id,
          ).query(`
              UPDATE campañas 
              SET entregas = entregas + 1 
              WHERE id = @campaignId
            `);
        }
      }

      // Commit the transaction
      await transaction.commit();
    } catch (error) {
      // If there's an error, roll back the transaction
      if (transaction) await transaction.rollback();
      console.error("Transaction error details:", error);
      throw error;
    }

    return { success: true, message: "Entrega recibida" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

// Editar Entrega ================================================================================= (pendiente)

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
    const uploadPromises = [];

    for (let i = 0; i < fileCount; i++) {
      const file = formData.get(`file${i}`) as File;

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

      // Get document count
      const countRequest = new sql.Request(transaction);
      const countResult = await countRequest.input("folio", sql.NVarChar, folio)
        .query(`
        SELECT COUNT(*) AS count
        FROM documentos
        WHERE folio = @folio
      `);

      const count = countResult.recordset[0].count;

      // Update status
      const updateRequest = new sql.Request(transaction);
      await updateRequest
        .input("folio", sql.NVarChar, folio)
        .input("estado", sql.NVarChar, count === 3 ? "Finalizado" : "En Curso")
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
    const pool = await connectToDB();

    // Check if document exists before deleting
    const documentRequest = pool.request().input("id", sql.NVarChar, id);
    const documentResult = await documentRequest.query(`
    SELECT id, folio FROM documentos
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
        documentResult.recordset[0].folio,
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

    // Fetch document from database
    const documentRequest = pool.request().input("id", sql.NVarChar, id);
    const documentResult = await documentRequest.query(`
    SELECT archivo, nombre_documento
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

// type Entregas = {
//   folio: string;
//   observacion: string;
//   rut: string;
//   id_usuario: string;
// };

// type Campaigns = {
//   campaign_name: string;
//   detail: string;
// };

// import { PDFDocument } from "pdf-lib";
// import fs from "fs";
// import path from "path";
// import { exec } from "child_process"; // Para la compresión del PDF

export const createAndDownloadPDFByFolio = async (folio: string) => {
  try {
    const pool = await connectToDB();
    console.log(folio);

    // Get delivery info
    const entregaRequest = pool.request().input("folio", sql.NVarChar, folio);
    const entregaResult = await entregaRequest.query(`
      SELECT observacion, rut, id_usuario
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

    const { observacion, rut, id_usuario } = entregaResult.recordset[0];
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
    const ciudadano = ciudadanoResult.recordset[0] as CitizenData;

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

    const form = pdfDoc.getForm();
    form.getTextField("Folio").setText(String(folio));
    form
      .getTextField("NombreCiudadano")
      .setText(`${ciudadano.nombres_rsh} ${ciudadano.apellidos_rsh}`);
    form.getTextField("Rut").setText(`${ciudadano.rut}-${ciudadano.dv}`);
    form.getTextField("Domicilio").setText(String(ciudadano.direccion));
    form.getTextField("Tramo").setText(`${ciudadano.tramo}%`);
    form.getTextField("Telefono").setText(ciudadano.telefono || "No aplica");
    form
      .getTextField("FechaSolicitud")
      .setText(new Date().toLocaleDateString());

    campaigns.forEach(({ campaign_name, detail }) => {
      if (campaign_name.includes("Vale de Gas")) {
        form.getTextField("CodigoGas").setText(detail);
      } else if (campaign_name.includes("Pañales")) {
        ["RN", "G", "XXG", "P", "XG", "Adultos"].forEach((tipo) => {
          if (detail.includes(tipo)) form.getTextField(tipo).setText("X");
        });
      } else if (campaign_name.includes("Tarjeta de Comida")) {
        form.getTextField("CodigoTarjeta").setText(detail);
      } else {
        form.getTextField("Otros").setText(detail);
      }
    });

    form.getTextField("Justificacion").setText(observacion);
    form.getTextField("NombreProfesional").setText(encargado.nombre_usuario);
    form.getTextField("Cargo").setText(encargado.cargo);
    form.getTextField("FechaEntrega").setText(new Date().toLocaleDateString());

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
