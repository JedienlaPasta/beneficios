"use server";
import sql from "mssql";
import * as ExcelJS from "exceljs";
import path from "path";
import { connectToDB } from "../utils/db-connection";
import { capitalizeAll } from "../utils/format";

interface Entrega {
  detalle: string;
  id_campaña: string;
}

interface Entregas {
  folio: string;
  rut: string;
  dv: string;
  fecha_entrega: string;
  beneficios_entregados: Entrega[];
  observacion: string;
  nombre_usuario: string;
  nombre_beneficiario: string;
  // folio_rsh: string;
}

export async function importEntregas() {
  const file = "output.xlsx";
  // const file = "output_checked.xlsx";
  try {
    // const filePath = path.join(process.cwd(), "public", "input.xlsx");
    const filePath = path.join(process.cwd(), "public", file);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    // Get headers from the first row
    const headerRow = worksheet.getRow(1);
    const headers: { [key: string]: number } = {};

    headerRow.eachCell((cell, colNumber) => {
      const headerName = cell.value?.toString().toLowerCase().trim();
      if (headerName) {
        headers[headerName] = colNumber;
      }
    });

    console.log("Headers found:", headers);

    const entregas: Entregas[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      // Helper function to get cell value by header name
      const getCellValue = (headerName: string): string => {
        const colIndex = headers[headerName.toLowerCase()];
        return colIndex ? row.getCell(colIndex).value?.toString() || "" : "";
      };

      console.log("Processing row:", rowNumber);

      const rawRut = getCellValue("RUT");
      if (!rawRut) return;
      const rut = rawRut?.split("-")[0];
      const dv = rawRut?.split("-")[1];

      const beneficios_entregados: Entrega[] = [];

      const campaña_1 = getCellValue("TARJETA");
      const detalle_1 = getCellValue("CODIGO TARJETA");
      if (campaña_1 && detalle_1) {
        beneficios_entregados.push({
          id_campaña: campaña_1,
          detalle: detalle_1,
        });
      }

      const campaña_2 = getCellValue("GAS");
      const detalle_2 = getCellValue("CODIGO GAS");
      if (campaña_2 && detalle_2) {
        beneficios_entregados.push({
          id_campaña: campaña_2,
          detalle: detalle_2,
        });
      }

      const entrega: Entregas = {
        folio: getCellValue("FOLIO"),
        rut,
        dv,
        fecha_entrega: getCellValue("FECHA DE ENTREGA"),
        beneficios_entregados: beneficios_entregados,
        nombre_usuario: capitalizeAll(getCellValue("ENTREGADO POR")),
        observacion: getCellValue("OBSERVACIONES") || "",
        nombre_beneficiario: capitalizeAll(getCellValue("NOMBRE COMPLETO")),
        // folio_rsh: getCellValue("folio_rsh"),
      };

      if (
        !entrega.folio ||
        !entrega.rut ||
        !entrega.fecha_entrega ||
        !entrega.nombre_usuario
      ) {
        console.log("Missing data:", entrega);
        return;
      }
      entregas.push(entrega);
    });

    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { success: false, message: "No connection to database" };
    }

    if (entregas.length === 0)
      return { success: false, message: "No data to import" };

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      let skippedRows = 0;
      const notFound = [];
      const duplicated = [];
      let index = 1;
      for (const entrega of entregas) {
        const nombre = entrega.nombre_usuario;
        const userRequest = new sql.Request(transaction);
        const userResult = await userRequest.input(
          "nombre_usuario",
          sql.VarChar,
          nombre,
        ).query(`
            SELECT id FROM usuarios WHERE nombre_usuario = @nombre_usuario
          `);
        const userId = userResult.recordset[0]?.id;
        if (!userId) {
          await transaction.rollback();
          return {
            success: false,
            message: `User not found by username: ${entrega.nombre_usuario}, folio: ${entrega.folio}`,
          };
        }

        // First check if the RUT exists in the rsh table
        const rutCheckRequest = new sql.Request(transaction);
        const rutExists = await rutCheckRequest
          .input("rut", sql.Int, Number(entrega.rut))
          .query(`SELECT 1 FROM rsh WHERE rut = @rut`);

        if (rutExists.recordset.length === 0) {
          console.log(`RUT ${entrega.rut} not found in rsh table`);
          skippedRows++;
          notFound.push({
            rut: entrega.rut + " " + entrega.dv,
            nombre: entrega.nombre_beneficiario,
            folio: entrega.folio,
          });
          continue;
        }

        // Check if the folio already exists in the entregas table
        const folioCheckRequest = new sql.Request(transaction);
        const folioExists = await folioCheckRequest
          .input("folio", sql.VarChar, entrega.folio)
          .query(`SELECT 1 FROM entregas WHERE folio = @folio`);

        if (folioExists.recordset.length > 0) {
          console.log(
            `Folio ${entrega.folio} already exists in entregas table`,
          );
          skippedRows++;
          duplicated.push({
            rut: entrega.rut + " " + entrega.dv,
            nombre: entrega.nombre_beneficiario,
            folio: entrega.folio,
          });
          continue;
        }

        // Parse and validate the date
        let fechaEntrega;
        try {
          fechaEntrega = new Date(entrega.fecha_entrega);
          // Check if the date is valid
          if (isNaN(fechaEntrega.getTime())) {
            console.log(
              `Invalid date format for folio ${entrega.folio}: ${entrega.fecha_entrega}`,
            );
            skippedRows++;
            continue;
          }
        } catch (error) {
          console.log(
            `Error parsing date for folio ${entrega.folio}: ${entrega.fecha_entrega}`,
          );
          console.log(error);
          skippedRows++;
          continue;
        }

        // Insert the main entrega record
        const entregaRequest = new sql.Request(transaction);
        const entregaResult = await entregaRequest
          .input("folio", sql.VarChar, entrega.folio)
          .input("fecha_entrega", sql.DateTime2, fechaEntrega)
          .input("rut", sql.Int, Number(entrega.rut))
          .input("userId", sql.UniqueIdentifier, userId)
          .input("estado_documentos", sql.VarChar, "En Curso")
          .input("observacion", sql.VarChar, entrega.observacion).query(`
            INSERT INTO entregas (folio, fecha_entrega, rut, id_usuario, estado_documentos, observacion)
            OUTPUT INSERTED.folio
            VALUES (@folio, @fecha_entrega, @rut, @userId, @estado_documentos, @observacion)
          `);

        const folio = entregaResult.recordset[0].folio;

        for (const beneficio of entrega.beneficios_entregados) {
          console.log(index + ": " + beneficio.id_campaña + " - " + folio);
          const beneficioRequest = new sql.Request(transaction);
          await beneficioRequest
            .input("detalle", sql.NVarChar, beneficio.detalle)
            .input("folio", sql.NVarChar, folio)
            .input("id_campaña", sql.NVarChar, beneficio.id_campaña).query(`
              INSERT INTO entrega (detalle, folio, id_campaña)
              VALUES (@detalle, @folio, @id_campaña)
            `);

          const updateCampaignRequest = new sql.Request(transaction);
          await updateCampaignRequest.input(
            "id_campaña",
            sql.UniqueIdentifier,
            beneficio.id_campaña,
          ).query(`
              UPDATE campañas
              SET entregas = entregas + 1
              WHERE id = @id_campaña
            `);
        }
        index++;
      }

      await transaction.commit();

      return {
        success: true,
        message: `Successfully imported ${entregas.length - skippedRows} records, skipped ${skippedRows} rows`,
        total: entregas.length,
        inserted: entregas.length - skippedRows,
        skipped: skippedRows,
        // data: entregas,
        notFound: notFound,
        duplicated: duplicated,
      };
    } catch (error) {
      console.log("Rollback");
      // Rollback the transaction on error
      await transaction.rollback();
      console.error("Transaction error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error importing entregas:", error);
  }
}
