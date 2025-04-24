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
}

export async function importEntregas() {
  try {
    const filePath = path.join(process.cwd(), "public", "input.xlsx");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const worksheet = workbook.worksheets[0];

    const entregas: Entregas[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const values = row.values as ExcelJS.CellValue[];

      const rawRut = values[2] ? values[2].toString() : "";
      if (!rawRut) return;
      const rut = rawRut?.split("-")[0];
      const dv = rawRut?.split("-")[1];

      const beneficios_entregados: Entrega[] = [];
      if (values[11]?.toString() && values[10]?.toString()) {
        beneficios_entregados.push({
          detalle: values[11]?.toString() || "",
          id_campaña: values[10]?.toString() || "",
        });
      }
      if (values[15]?.toString() && values[14]?.toString()) {
        beneficios_entregados.push({
          detalle: values[15]?.toString() || "",
          id_campaña: values[14]?.toString() || "",
        });
      }

      const entrega: Entregas = {
        folio: values[1]?.toString() || "",
        rut,
        dv,
        fecha_entrega: values[9]?.toString() || "",
        beneficios_entregados: beneficios_entregados,
        nombre_usuario: capitalizeAll(values[19]?.toString()) || "",
        observacion: values[17]?.toString() || "",
      };

      if (
        !entrega.folio ||
        !entrega.rut ||
        !entrega.fecha_entrega ||
        !entrega.nombre_usuario
      ) {
        return;
      }
      entregas.push(entrega);
    });

    const pool = await connectToDB();
    if (entregas.length === 0)
      return { success: false, message: "No data to import" };

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      let skippedRows = 0;
      const notFound = [];
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
            message: `User not found for nombre_usuario: ${entrega.nombre_usuario}`,
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
            nombre: entrega.nombre_usuario,
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
          console.log(beneficio.id_campaña);
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
      }

      await transaction.commit();

      return {
        success: true,
        message: `Successfully imported ${entregas.length} records, skipped ${skippedRows} rows`,
        count: entregas.length,
        skipped: skippedRows,
        data: entregas,
        notFound: notFound,
      };
    } catch (error) {
      console.log("Rollback");
      // Rollback the transaction on error
      await transaction.rollback();
      console.error("Transaction error:", error);
      throw error;
    }
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}
