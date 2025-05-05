"use server";
import sql from "mssql";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import * as ExcelJS from "exceljs";
import { FormState } from "@/app/ui/dashboard/campañas/new-campaign-modal";
import { connectToDB } from "../utils/db-connection";
import { capitalize, capitalizeAll, formatRUT } from "../utils/format";
import { logAction } from "./auditoria";
import { getDV } from "../utils/get-values";

const RSHFormSchema = z.object({
  // Required fields
  rut: z
    .string()
    .min(7, { message: "RUT debe tener al menos 7 dígitos" })
    .regex(/^\d+$/, { message: "RUT debe contener solo números" }),
  dv: z.string().length(1, { message: "DV es obligatorio" }),
  nombres_rsh: z
    .string()
    .min(3, { message: "Nombres deben tener al menos 3 caracteres" }),
  apellidos_rsh: z
    .string()
    .min(3, { message: "Apellidos deben tener al menos 3 caracteres" }),
  direccion: z
    .string()
    .min(3, { message: "Dirección debe tener al menos 3 caracteres" }),
  tramo: z.enum(["40", "50", "60", "70", "80", "90", "100"], {
    message:
      "Tramo debe ser uno de los valores permitidos: 40, 50, 60, 70, 80, 90 o 100",
  }),
  folio: z.string().length(8, { message: "Folio debe tener 8 dígitos" }),

  // Optional fields
  sector: z.string().optional(),
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 9, {
      message: "Teléfono debe tener 9 dígitos",
    }),
  correo: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Formato de correo electrónico inválido",
    }),
  genero: z
    .union([z.enum(["Femenino", "Masculino"]), z.literal("")])
    .optional(),
  indigena: z.union([z.enum(["Si", "No", "Sí"]), z.literal("")]).optional(),
  nacionalidad: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
});

// Crear RSH
export async function createRSH(formData: FormData) {
  const rut = formData.get("rut") as string;
  const dv = formData.get("dv") as string;
  const nombresRSH = formData.get("nombres_rsh") as string;
  const apellidosRSH = formData.get("apellidos_rsh") as string;
  const direccion = formData.get("direccion") as string;
  const sector = formData.get("sector") as string;
  const telefono = formData.get("telefono") as string;
  const correo = formData.get("correo") as string;
  const tramo = formData.get("tramo") as string;
  const genero = formData.get("genero") as string;
  const indigena = formData.get("indigena") as string;
  const nacionalidad = formData.get("nacionalidad") as string;
  const folio = formData.get("folio") as string;
  const fecha_nacimiento = formData.get("fecha_nacimiento") as string;

  const checkDV = getDV(rut);
  if (checkDV !== dv) {
    return {
      success: false,
      message: "El DV no coincide con el RUT",
    };
  }

  const validationResult = RSHFormSchema.safeParse({
    rut,
    dv,
    nombres_rsh: capitalizeAll(nombresRSH),
    apellidos_rsh: capitalizeAll(apellidosRSH),
    direccion: capitalizeAll(direccion),
    sector: capitalizeAll(sector),
    telefono,
    correo,
    tramo,
    genero: capitalize(genero),
    indigena: capitalize(indigena),
    nacionalidad: capitalize(nacionalidad),
    folio,
    fecha_nacimiento: fecha_nacimiento
      ? new Date(fecha_nacimiento).toISOString()
      : undefined,
  });

  if (!validationResult.success) {
    return {
      success: false,
      message: validationResult.error.errors[0].message,
    };
  }

  try {
    const pool = await connectToDB();
    const request = pool.request();

    // Check if rut already exists
    const rshResult = await request
      .input("userRut", sql.Int, rut)
      .query("SELECT 1 FROM rsh WHERE rut = @userRut");

    if (rshResult.recordset.length > 0) {
      return { success: false, message: "Ya existe un registro con este RUT" };
    }

    await request
      .input("rut", sql.Int, validationResult.data.rut)
      .input("dv", sql.VarChar, validationResult.data.dv)
      .input("nombres_rsh", sql.VarChar, validationResult.data.nombres_rsh)
      .input("apellidos_rsh", sql.VarChar, validationResult.data.apellidos_rsh)
      .input("direccion", sql.VarChar, validationResult.data.direccion)
      .input("sector", sql.VarChar, validationResult.data.sector)
      .input("telefono", sql.VarChar, validationResult.data.telefono)
      .input("correo", sql.VarChar, validationResult.data.correo)
      .input("tramo", sql.VarChar, validationResult.data.tramo)
      .input("genero", sql.VarChar, validationResult.data.genero)
      .input("indigena", sql.VarChar, validationResult.data.indigena)
      .input("nacionalidad", sql.VarChar, validationResult.data.nacionalidad)
      .input("folio", sql.VarChar, validationResult.data.folio)
      .input(
        "fecha_nacimiento",
        sql.VarChar,
        validationResult.data.fecha_nacimiento,
      ).query(`
        INSERT INTO rsh (rut, dv, nombres_rsh, apellidos_rsh, direccion, sector, telefono, correo, tramo, genero, indigena, nacionalidad, folio, fecha_nacimiento)
        VALUES (@rut, @dv, @nombres_rsh, @apellidos_rsh, @direccion, @sector, @telefono, @correo, @tramo, @genero, @indigena, @nacionalidad, @folio, @fecha_nacimiento)
        `);

    const formatedRut = formatRUT(rut);
    await logAction("Crear", "creó el RSH", formatedRut);
    revalidatePath("/dashboard/rsh");
    return {
      success: true,
      message: `Registro ${formatedRut} creado exitosamente`,
    };
  } catch (error) {
    console.error(error || "Error al crear el registro.");
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

const RSHUpdateFormSchema = z.object({
  rut: z
    .string()
    .min(7, { message: "RUT debe tener al menos 7 dígitos" })
    .regex(/^\d+$/, { message: "RUT debe contener solo números" }),
  direccion: z
    .string()
    .min(3, { message: "Dirección debe tener al menos 3 caracteres" }),
  sector: z.string().optional(),
  telefono: z
    .string()
    .optional()
    .refine((val) => !val || val.length === 9, {
      message: "Teléfono debe tener 9 dígitos",
    }),
  correo: z
    .string()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Formato de correo electrónico inválido",
    }),
});

// Editar RSH
export async function updateRSH(formData: FormData) {
  console.log(formData);
  const rut = formData.get("rut") as string;
  const direccion = formData.get("direccion") as string;
  const sector = formData.get("sector") as string;
  const telefono = formData.get("telefono") as string;
  const correo = formData.get("correo") as string;

  const validationResult = RSHUpdateFormSchema.safeParse({
    rut,
    direccion: capitalizeAll(direccion),
    sector: capitalizeAll(sector),
    telefono,
    correo,
  });

  if (!validationResult.success) {
    return {
      success: false,
      message: validationResult.error.errors[0].message,
    };
  }

  const formatedRut = formatRUT(rut);

  try {
    const pool = await connectToDB();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const rshRequest = new sql.Request(transaction);
      const rshResult = await rshRequest
        .input("rut", sql.Int, rut)
        .query("SELECT 1 FROM rsh WHERE rut = @rut");

      if (rshResult.recordset.length === 0) {
        return {
          success: false,
          message: `No se encontraron coincidencias para ${formatedRut}`,
        };
      }

      const rshModsRequest = new sql.Request(transaction);
      const rshModsResult = await rshModsRequest
        .input("rut", sql.Int, rut)
        .query("SELECT 1 FROM rsh_mods WHERE rut = @rut");

      if (rshModsResult.recordset.length === 0) {
        const updateRshModsRequest = new sql.Request(transaction);
        await updateRshModsRequest
          .input("rut", sql.Int, validationResult.data.rut)
          .input("direccion", sql.VarChar, validationResult.data.direccion)
          .input("sector", sql.VarChar, validationResult.data.sector)
          .input("telefono", sql.VarChar, validationResult.data.telefono)
          .input("correo", sql.VarChar, validationResult.data.correo).query(`
            INSERT INTO rsh_mods (direccion_mod, sector_mod, telefono_mod, correo_mod, rut)
            VALUES (@direccion, @sector, @telefono, @correo, @rut)
          `);
      } else {
        const updateRshModsRequest = new sql.Request(transaction);
        await updateRshModsRequest
          .input("rut", sql.Int, validationResult.data.rut)
          .input("direccion_mod", sql.VarChar, validationResult.data.direccion)
          .input("sector_mod", sql.VarChar, validationResult.data.sector)
          .input("telefono_mod", sql.VarChar, validationResult.data.telefono)
          .input("correo_mod", sql.VarChar, validationResult.data.correo)
          .query(`
            UPDATE rsh_mods
            SET
              direccion_mod = @direccion_mod,
              sector_mod = @sector_mod,
              telefono_mod = @telefono_mod,
              correo_mod = @correo_mod
            WHERE rut = @rut
          `);
      }

      await transaction.commit();
      await logAction("Editar", "editó el RSH", formatedRut);
      revalidatePath("/dashboard/rsh");
      return {
        success: true,
        message: `Registro ${formatedRut} actualizado exitosamente`,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error(error || "Error actualizar el registro.");
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

// Eliminar RSH
export async function deleteRSH(rut: string) {
  try {
    const pool = await connectToDB();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const rshRequest = new sql.Request(transaction);
      const rshResult = await rshRequest
        .input("rut", sql.Int, rut)
        .query(`SELECT 1 FROM rsh WHERE rut = @rut`);

      if (rshResult.recordset.length === 0) {
        await transaction.rollback();
        return {
          success: false,
          message: `No se encontró el registro ${formatRUT(rut)}`,
        };
      }

      const deleteRshRequest = new sql.Request(transaction);
      await deleteRshRequest
        .input("rut", sql.Int, rut)
        .query(`DELETE FROM rsh WHERE rut = @rut`);

      // ON DELETE CASCADE de entregas?
      await transaction.commit();

      await logAction("Eliminar", "eliminó el RSH", formatRUT(rut));
      revalidatePath("/dashboard/rsh");
      return {
        success: true,
        message: `Registro ${formatRUT(rut)} eliminado exitosamente`,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.log("Error al eliminar el registro:", error);
    return {
      success: false,
      message: `Error al eliminar el registro ${formatRUT(rut)}`,
    };
  }
}

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

// Importar XLSX
export async function importXLSXFile(formData: FormData): Promise<FormState> {
  const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  };

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
      const calle = values[75] ? capitalizeAll(values[75]?.toString()) : "";
      const numcalle = values[3] ? String(values[3]) : null;
      const sector = values[78]
        ? capitalizeAll(values[78]?.toString()).trim()
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
              : "Si",
        genero: values[67] == 1 ? "Masculino" : "Femenino",
        nacionalidad:
          values[69] && Number(values[69]) == 1
            ? "Chilena"
            : values[69]
              ? "Extranjera"
              : null,
        sector: sector
          ? sector.length > 3
            ? sector.substring(0, sector.length - 3)
            : sector
          : null,
        direccion: `${calle} ${numcalle}`.trim(),
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

    await logAction("importar", "actualizó", "RSH");

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
