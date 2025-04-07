"use server";
import sql from "mssql";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as ExcelJS from "exceljs";
import { FormState } from "@/app/ui/dashboard/campañas/new-campaign-modal";
import { connectToDB } from "../utils/db-connection";
import { capitalizeAll } from "../utils/format";

// Crear RSH

// Editar RSH

// Eliminar RSH

// ---------------- Cargar RSH desde Excel ------------
// Interfaces
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

// Helpers
const capitalizeWords = (text: string): string =>
  text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const convertDate = (dateString: string): Date | null => {
  const str = String(dateString).padStart(8, "0");
  if (str.length !== 8) return null;

  const year = parseInt(str.substring(0, 4));
  const month = parseInt(str.substring(4, 6)) - 1;
  const day = parseInt(str.substring(6, 8));

  return isNaN(year) || isNaN(month) || isNaN(day)
    ? null
    : new Date(year, month, day);
};

// const formatCurrentDate = (): Date => {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth();
//   const day = now.getDate();

//   return new Date(year, month, day);
// };

const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

// Validación Zod
const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        file.size > 0 &&
        [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ].includes(file.type),
      { message: "Archivo Excel requerido (.xls, .xlsx)" },
    ),
});

export async function importXLSXFile(formData: FormData): Promise<FormState> {
  try {
    const { file } = FileSchema.parse({
      file: formData.get("file"),
    });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];

    const citizens: CitizenData[] = [];
    let validRows = 0;
    let skippedRows = 0;

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Saltar cabecera

      const values = row.values as ExcelJS.CellValue[];

      // Validar RUT (campo obligatorio)
      const rawRut = values[12] ? String(values[12]) : "";
      if (!rawRut) {
        skippedRows++;
        return;
      }

      // Procesar campos (optimizado)
      const apellidopaterno = values[14]
        ? capitalizeWords(String(values[14]))
        : "";
      const apellidomaterno = values[15]
        ? capitalizeWords(String(values[15]))
        : null;
      const citizen: CitizenData = {
        rut: rawRut,
        dv: String(values[13]),
        nombres_rsh: values[16] ? capitalizeWords(String(values[16])) : "",
        apellidopaterno,
        apellidomaterno,
        apellidos_rsh: `${apellidopaterno} ${apellidomaterno || ""}`.trim(),
        telefono: values[1] ? String(values[1]).replace(/\D/g, "") : null,
        correo: values[2] ? String(values[2]) : null,
        indigena:
          values[20] === null ||
          values[20] === undefined ||
          values[20] === "" ||
          isNaN(Number(values[20]))
            ? null
            : parseInt(String(values[20]), 10) === 0
              ? "No"
              : "Sí",
        genero: values[67] == 1 ? "Masculino" : "Femenino",
        nacionalidad:
          values[69] && Number(values[69]) == 1
            ? "Chilena"
            : values[69]
              ? "Extranjera"
              : null,
        sector: values[78] ? capitalizeAll(values[78]?.toString()) : null,
        calle: values[75] ? capitalizeAll(values[75]?.toString()) : "",
        numcalle: values[3] ? String(values[3]) : null,
        direccion:
          `${capitalizeAll(values[75]?.toString()) || ""} ${capitalizeAll(values[3]?.toString()) || ""}`.trim(),
        tramo: values[70] ? String(values[70]) : "",
        folio: values[64] ? String(values[64]) : "",
        fecha_nacimiento: convertDate(String(values[68])),
        fecha_encuesta: convertDate(String(values[63])),
        fecha_modificacion: convertDate(String(values[65])),
        fecha_calificacion: convertDate(String(values[71])),
      };

      if (!citizen.rut || !citizen.nombres_rsh || !citizen.apellidopaterno) {
        skippedRows++;
        return;
      }
      citizens.push(citizen);
      validRows++;
    });

    const pool = await connectToDB();

    if (citizens.length > 0) {
      const transaction = new sql.Transaction(pool);
      await transaction.begin();
      const start = new Date();

      try {
        // Check database context and permissions
        const checkRequest = new sql.Request(transaction);
        console.log("Iniciando importación RSH...");

        // Check if table type exists and is accessible - search across all schemas
        const typeCheckResult = await checkRequest.query(`
          SELECT 
            t.name AS type_name,
            s.name AS schema_name
          FROM sys.types t
          JOIN sys.schemas s ON t.schema_id = s.schema_id
          WHERE t.name = 'RSHTableType'
        `);

        let useTemporaryTable = false;
        let schemaName = "dbo"; // Default schema

        if (typeCheckResult.recordset.length === 0) {
          useTemporaryTable = true;
        } else {
          const typeInfo = typeCheckResult.recordset[0];
          schemaName = typeInfo.schema_name;
        }

        // Check if stored procedure exists
        const procCheckResult = await checkRequest.query(`
          SELECT 
            p.name AS proc_name,
            s.name AS schema_name
          FROM sys.procedures p
          JOIN sys.schemas s ON p.schema_id = s.schema_id
          WHERE p.name = 'sp_MergeRSHBatch'
        `);

        let procSchemaName = "dbo"; // Default schema

        if (procCheckResult.recordset.length > 0) {
          const procInfo = procCheckResult.recordset[0];
          procSchemaName = procInfo.schema_name;
        }

        // Define CHUNK_SIZE once and create chunks array once
        const CHUNK_SIZE = 2000;
        const chunks = chunkArray(citizens, CHUNK_SIZE);
        console.log(`Procesando ${chunks.length} lotes de datos...`);

        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
          const currentChunk = chunks[chunkIndex];
          console.log(
            `Lote ${chunkIndex + 1}/${chunks.length}: ${currentChunk.length} registros`,
          );

          // For the first chunk, try with a smaller batch size to test
          if (chunkIndex === 0) {
            const testChunk = currentChunk.slice(0, 10);

            try {
              const testRequest = new sql.Request(transaction);

              // Create a TVP (Table-Valued Parameter)
              const tvp = new sql.Table();

              // Define the TVP structure to match RSHTableType
              tvp.columns.add("rut", sql.Int, { nullable: false });
              tvp.columns.add("dv", sql.Char(1), { nullable: false });
              tvp.columns.add("nombres_rsh", sql.VarChar(50), {
                nullable: false,
              });
              tvp.columns.add("apellidos_rsh", sql.VarChar(50), {
                nullable: false,
              });
              tvp.columns.add("direccion", sql.VarChar(200), {
                nullable: false,
              });
              tvp.columns.add("sector", sql.VarChar(50), { nullable: true });
              tvp.columns.add("telefono", sql.VarChar(20), { nullable: true });
              tvp.columns.add("correo", sql.VarChar(50), { nullable: true });
              tvp.columns.add("tramo", sql.VarChar(10), { nullable: false });
              tvp.columns.add("genero", sql.VarChar(20), { nullable: true });
              tvp.columns.add("indigena", sql.VarChar(20), { nullable: true });
              tvp.columns.add("nacionalidad", sql.VarChar(30), {
                nullable: true,
              });
              tvp.columns.add("folio", sql.VarChar(20), { nullable: false });
              tvp.columns.add("fecha_nacimiento", sql.DateTime2(7), {
                nullable: true,
              });
              tvp.columns.add("fecha_calificacion", sql.DateTime2(7), {
                nullable: true,
              });
              tvp.columns.add("fecha_encuesta", sql.DateTime2(7), {
                nullable: true,
              });
              tvp.columns.add("fecha_modificacion", sql.DateTime2(7), {
                nullable: true,
              });

              // Insert test data into TVP
              for (const citizen of testChunk) {
                const rutInt = parseInt(citizen.rut, 10);
                if (isNaN(rutInt)) continue;

                // Ensure required fields have values
                if (
                  !citizen.dv ||
                  !citizen.nombres_rsh ||
                  !citizen.apellidos_rsh ||
                  !citizen.direccion ||
                  !citizen.tramo ||
                  !citizen.folio
                )
                  continue;

                try {
                  // Add row to TVP
                  tvp.rows.add(
                    rutInt,
                    citizen.dv,
                    citizen.nombres_rsh,
                    citizen.apellidos_rsh,
                    citizen.direccion,
                    citizen.sector || null,
                    citizen.telefono || null,
                    citizen.correo || null,
                    citizen.tramo,
                    citizen.genero || null,
                    citizen.indigena || null,
                    citizen.nacionalidad || null,
                    citizen.folio,
                    citizen.fecha_nacimiento || null,
                    citizen.fecha_calificacion || null,
                    citizen.fecha_encuesta || null,
                    citizen.fecha_modificacion || null,
                  );
                } catch (rowError) {
                  console.error(`Error en RUT ${citizen.rut}:`, rowError);
                  throw rowError;
                }
              }

              // Execute the stored procedure with the TVP
              testRequest.input("RSHData", tvp);
              await testRequest.execute(`${procSchemaName}.sp_MergeRSHBatch`);
            } catch (testErr) {
              console.error("Error en prueba inicial:", testErr);
              throw testErr;
            }
          }

          // Continue with the regular processing for all chunks
          try {
            const batchRequest = new sql.Request(transaction);

            // Create a TVP (Table-Valued Parameter)
            const tvp = new sql.Table();

            // Define the TVP structure to match RSHTableType
            tvp.columns.add("rut", sql.Int, { nullable: false });
            tvp.columns.add("dv", sql.Char(1), { nullable: false });
            tvp.columns.add("nombres_rsh", sql.VarChar(50), {
              nullable: false,
            });
            tvp.columns.add("apellidos_rsh", sql.VarChar(50), {
              nullable: false,
            });
            tvp.columns.add("direccion", sql.VarChar(200), { nullable: false });
            tvp.columns.add("sector", sql.VarChar(50), { nullable: true });
            tvp.columns.add("telefono", sql.VarChar(20), { nullable: true });
            tvp.columns.add("correo", sql.VarChar(50), { nullable: true });
            tvp.columns.add("tramo", sql.VarChar(10), { nullable: false });
            tvp.columns.add("genero", sql.VarChar(20), { nullable: true });
            tvp.columns.add("indigena", sql.VarChar(20), { nullable: true });
            tvp.columns.add("nacionalidad", sql.VarChar(30), {
              nullable: true,
            });
            tvp.columns.add("folio", sql.VarChar(20), { nullable: false });
            tvp.columns.add("fecha_nacimiento", sql.DateTime2(7), {
              nullable: true,
            });
            tvp.columns.add("fecha_calificacion", sql.DateTime2(7), {
              nullable: true,
            });
            tvp.columns.add("fecha_encuesta", sql.DateTime2(7), {
              nullable: true,
            });
            tvp.columns.add("fecha_modificacion", sql.DateTime2(7), {
              nullable: true,
            });

            // Build batch insert for all records in the chunk
            let insertCount = 0;
            for (const citizen of currentChunk) {
              const rutInt = parseInt(citizen.rut, 10);
              if (isNaN(rutInt)) continue;

              // Ensure required fields have values
              if (
                !citizen.dv ||
                !citizen.nombres_rsh ||
                !citizen.apellidos_rsh ||
                !citizen.direccion ||
                !citizen.tramo ||
                !citizen.folio
              )
                continue;

              try {
                // Add row to TVP
                tvp.rows.add(
                  rutInt,
                  citizen.dv,
                  citizen.nombres_rsh,
                  citizen.apellidos_rsh,
                  citizen.direccion,
                  citizen.sector || null,
                  citizen.telefono || null,
                  citizen.correo || null,
                  citizen.tramo,
                  citizen.genero || null,
                  citizen.indigena || null,
                  citizen.nacionalidad || null,
                  citizen.folio,
                  citizen.fecha_nacimiento || null,
                  citizen.fecha_calificacion || null,
                  citizen.fecha_encuesta || null,
                  citizen.fecha_modificacion || null,
                );
                insertCount++;
              } catch (rowError) {
                console.error(`Error en RUT ${citizen.rut}:`, rowError);
                throw rowError;
              }
            }

            // If we have valid records, execute the stored procedure
            if (insertCount > 0) {
              batchRequest.input("RSHData", tvp);
              await batchRequest.execute(`${procSchemaName}.sp_MergeRSHBatch`);
              console.log(
                `Lote ${chunkIndex + 1} completado: ${insertCount} registros`,
              );
            }
          } catch (spError) {
            console.error("Error en procesamiento de lote:", spError);
            throw spError;
          }
        }

        // Update rsh_info table
        console.log("Actualizando tabla rsh_info...");
        await transaction.request().query("DELETE FROM rsh_info");
        await transaction
          .request()
          .query("INSERT INTO rsh_info DEFAULT VALUES");

        // Commit the transaction
        await transaction.commit();
        const end = new Date();
        const elapsedTime = end.getTime() - start.getTime();
        const seconds = Math.floor(elapsedTime / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        console.log(
          `Importación completada en ${minutes > 0 ? `${minutes}m ` : ""}${remainingSeconds}s (${elapsedTime}ms)`,
        );
      } catch (error) {
        console.error("Error en transacción:", error);

        // Check for permission-related errors
        const errorMessage =
          error instanceof Error ? error.message : "Error desconocido";
        const isPermissionError =
          errorMessage.includes("permission") ||
          errorMessage.includes("privilege") ||
          errorMessage.includes("access");

        if (isPermissionError) {
          console.error("Error de permisos en la base de datos");
          return {
            success: false,
            message:
              "Error de permisos en la base de datos. Contacte al administrador.",
          };
        }

        try {
          await transaction.rollback();
          console.log("Transacción revertida");
        } catch (rollbackError) {
          console.error("Error al revertir transacción:", rollbackError);
        }
        throw error;
      }
    }

    revalidatePath("/dashboard/rsh");

    return {
      success: true,
      message: `Procesadas ${validRows} filas (${skippedRows} omitidas)`,
    };
  } catch (error) {
    console.error("Error en importación:", error);
    return {
      success: false,
      message: `Error al procesar archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
    };
  }
}
