"use server";
import sql from "mssql";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as ExcelJS from "exceljs";
import { FormState } from "@/app/ui/dashboard/campañas/new-campaign-modal";
import { connectToDB } from "../utils/db-connection";

// Crear RSH

// Editar RSH

// Eliminar RSH

// ---------------- Cargar RSH desde Excel ------------
// Interfaces
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

export async function importXLSXFile(
  // prevState: FormState,
  formData: FormData,
): Promise<FormState> {
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

      // Procesar campos
      const [apellidopaterno, apellidomaterno] = [
        values[14] ? capitalizeWords(String(values[14])) : "",
        values[15] ? capitalizeWords(String(values[15])) : null,
      ];
      const citizen: CitizenData = {
        rut: rawRut,
        dv: values[13] as string,
        nombres: values[16] ? capitalizeWords(String(values[16])) : "",
        apellidopaterno,
        apellidomaterno,
        apellidos: `${apellidopaterno} ${apellidomaterno || ""}`.trim(),
        telefono: values[1] ? String(values[1]).replace(/\D/g, "") : null,
        correo: values[2] ? String(values[2]) : null,
        indigena: (() => {
          const value = values[20];
          if (
            value === null ||
            value === undefined ||
            value === "" ||
            isNaN(Number(value))
          ) {
            return null;
          }

          const numericValue = parseInt(String(value), 10);

          return numericValue === 0 ? "No" : "Sí";
        })(),
        genero: values[67] == 1 ? "Masculino" : "Femenino",
        nacionalidad: values[69]
          ? Number(values[69]) == 1
            ? "Chilena"
            : "Extranjera"
          : null,
        sector: values[78] ? String(values[78]) : null,
        calle: values[75] ? String(values[75]) : "",
        numcalle: values[3] ? String(values[3]) : null,
        direccion: `${values[75] || ""} ${values[3] || ""}`.trim(),
        tramo: values[70] ? String(values[70]) : "",
        folio: values[64] ? String(values[64]) : "",
        fecha_nacimiento: convertDate(String(values[68])),
        fecha_encuesta: convertDate(String(values[63])),
        fecha_modificacion: convertDate(String(values[65])),
        fecha_calificacion: convertDate(String(values[71])),
      };

      // Validación adicional
      if (!citizen.rut || !citizen.nombres || !citizen.apellidopaterno) {
        skippedRows++;
        return;
      }

      console.log("RUT: " + citizen.rut + " DV: " + citizen.dv);

      citizens.push(citizen);
      validRows++;
    });

    const pool = await connectToDB();

    // Bulk insert for MSSQL
    if (citizens.length > 0) {
      // Use a transaction for better performance
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        // Process in chunks to avoid parameter limits
        const CHUNK_SIZE = 1000; // Reduced chunk size for stability
        const chunks = chunkArray(citizens, CHUNK_SIZE);

        for (const chunk of chunks) {
          // Process each citizen in the chunk with batch operations
          for (const citizen of chunk) {
            const request = new sql.Request(transaction);

            try {
              // Use MERGE statement for each record (still faster than separate check+insert/update)
              await request
                .input("rut", sql.Int, parseInt(citizen.rut, 10))
                .input("dv", sql.Char(1), citizen.dv.toString().substring(0, 1))
                .input(
                  "nombres_rsh",
                  sql.NVarChar(50),
                  (citizen.nombres || "").substring(0, 50),
                )
                .input(
                  "apellidos_rsh",
                  sql.NVarChar(50),
                  (citizen.apellidos || "").substring(0, 50),
                )
                .input(
                  "direccion",
                  sql.NVarChar(50),
                  (citizen.direccion || "").substring(0, 50),
                )
                .input(
                  "sector",
                  sql.NVarChar(50),
                  citizen.sector ? citizen.sector.substring(0, 50) : null,
                )
                .input(
                  "telefono",
                  sql.Int,
                  citizen.telefono
                    ? parseInt(citizen.telefono, 10) || null
                    : null,
                )
                .input(
                  "correo",
                  sql.NVarChar(50),
                  citizen.correo ? citizen.correo.substring(0, 50) : null,
                )
                .input(
                  "tramo",
                  sql.Int,
                  citizen.tramo ? parseInt(citizen.tramo, 10) || 0 : 0,
                )
                .input(
                  "genero",
                  sql.NVarChar(20),
                  citizen.genero ? citizen.genero.substring(0, 20) : null,
                )
                .input(
                  "indigena",
                  sql.NVarChar(20),
                  citizen.indigena ? citizen.indigena.substring(0, 20) : null,
                )
                .input(
                  "nacionalidad",
                  sql.NVarChar(30),
                  citizen.nacionalidad
                    ? citizen.nacionalidad.substring(0, 30)
                    : null,
                )
                .input(
                  "folio",
                  sql.Int,
                  citizen.folio ? parseInt(citizen.folio, 10) || 0 : 0,
                )
                .input(
                  "fecha_nacimiento",
                  sql.DateTime2,
                  citizen.fecha_nacimiento,
                )
                .input("fecha_encuesta", sql.DateTime2, citizen.fecha_encuesta)
                .input(
                  "fecha_calificacion",
                  sql.DateTime2,
                  citizen.fecha_calificacion,
                )
                .input(
                  "fecha_modificacion",
                  sql.DateTime2,
                  citizen.fecha_modificacion,
                ).query(`
                  MERGE rsh AS target
                  USING (SELECT 
                    @rut as rut, @dv as dv, @nombres_rsh as nombres_rsh, @apellidos_rsh as apellidos_rsh,
                    @direccion as direccion, @sector as sector, @telefono as telefono, @correo as correo,
                    @tramo as tramo, @genero as genero, @indigena as indigena, @nacionalidad as nacionalidad,
                    @folio as folio, @fecha_nacimiento as fecha_nacimiento, @fecha_calificacion as fecha_calificacion,
                    @fecha_encuesta as fecha_encuesta, @fecha_modificacion as fecha_modificacion
                  ) AS source
                  ON target.rut = source.rut
                  WHEN MATCHED THEN
                    UPDATE SET
                      dv = source.dv,
                      nombres_rsh = source.nombres_rsh,
                      apellidos_rsh = source.apellidos_rsh,
                      direccion = source.direccion,
                      sector = source.sector,
                      telefono = source.telefono,
                      correo = source.correo,
                      tramo = source.tramo,
                      genero = source.genero,
                      indigena = source.indigena,
                      nacionalidad = source.nacionalidad,
                      folio = source.folio,
                      fecha_nacimiento = source.fecha_nacimiento,
                      fecha_calificacion = source.fecha_calificacion,
                      fecha_encuesta = source.fecha_encuesta,
                      fecha_modificacion = source.fecha_modificacion
                  WHEN NOT MATCHED THEN
                    INSERT (
                      rut, dv, nombres_rsh, apellidos_rsh, direccion, sector, telefono, 
                      correo, tramo, genero, indigena, nacionalidad, folio,
                      fecha_nacimiento, fecha_calificacion, fecha_encuesta, fecha_modificacion
                    )
                    VALUES (
                      source.rut, source.dv, source.nombres_rsh, source.apellidos_rsh, source.direccion, 
                      source.sector, source.telefono, source.correo, source.tramo, source.genero, 
                      source.indigena, source.nacionalidad, source.folio, source.fecha_nacimiento, 
                      source.fecha_calificacion, source.fecha_encuesta, source.fecha_modificacion
                    );
                `);
            } catch (err) {
              console.error(
                `Error processing citizen with RUT ${citizen.rut}:`,
                err,
              );
              // Continue with next record - don't abort the whole transaction
            }
          }
        }

        // Update metadata within the same transaction
        await transaction.request().query("DELETE FROM rsh_info");
        await transaction
          .request()
          .query("INSERT INTO rsh_info DEFAULT VALUES");

        // Commit the transaction
        await transaction.commit();
      } catch (error) {
        // Rollback on error
        await transaction.rollback();
        console.error("Transaction error:", error);
        throw error;
      }
    }

    // Actualizar metadatos
    const metadataRequest = pool.request();
    await metadataRequest.query("DELETE FROM rsh_info");
    await metadataRequest.query("INSERT INTO rsh_info DEFAULT VALUES");

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
