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

// Create RSH Record
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
  const fecha_nacimiento = formData.get("fechaNacimiento") as string;

  const checkDV = getDV(rut);
  if (checkDV !== dv) {
    return {
      success: false,
      message: "El DV no coincide con el RUT",
    };
  }

  const validationResult = RSHFormSchema.safeParse({
    rut: rut.trim(),
    dv: dv.trim(),
    nombres_rsh: capitalizeAll(nombresRSH),
    apellidos_rsh: capitalizeAll(apellidosRSH),
    direccion: capitalizeAll(direccion),
    sector: capitalizeAll(sector),
    telefono: telefono.trim(),
    correo: correo.trim(),
    tramo: tramo.trim(),
    genero: capitalize(genero),
    indigena: capitalize(indigena),
    nacionalidad: capitalize(nacionalidad),
    folio: folio.trim(),
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
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

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

// Edit RSH Contact Info
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

export async function updateRSH(formData: FormData) {
  const rut = formData.get("rut") as string;
  const direccion = formData.get("direccion") as string;
  const sector = formData.get("sector") as string;
  const telefono = formData.get("telefono") as string;
  const correo = formData.get("correo") as string;

  const validationResult = RSHUpdateFormSchema.safeParse({
    rut: rut.trim(),
    direccion: capitalizeAll(direccion),
    sector: capitalizeAll(sector),
    telefono: telefono.trim(),
    correo: correo.trim(),
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
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

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

// Edit RSH General Info
const RSHUpdateGeneralInfoFormSchema = z.object({
  rut: z
    .string()
    .min(7, { message: "RUT debe tener al menos 7 dígitos" })
    .regex(/^\d+$/, { message: "RUT debe contener solo números" }),
  nacionalidad: z
    .union([z.enum(["Chilena", "Extranjera"]), z.literal("")])
    .optional(),
  genero: z
    .union([z.enum(["Femenino", "Masculino"]), z.literal("")])
    .optional(),
  indigena: z.union([z.enum(["Si", "No", "Sí"]), z.literal("")]).optional(),
  fecha_nacimiento: z.preprocess(
    (v) => (typeof v === "string" && v ? new Date(v) : undefined),
    z.date().optional(),
  ),
});

export async function updateRSHGeneralInfo(formData: FormData) {
  const rut = formData.get("rut") as string;
  const nacionalidad = formData.get("nacionalidad") as string;
  const genero = formData.get("genero") as string;
  const indigena = formData.get("indigena") as string;
  const fecha_nacimiento = formData.get("fecha_nacimiento") as string;

  const validationResult = RSHUpdateGeneralInfoFormSchema.safeParse({
    rut: rut.trim(),
    nacionalidad: capitalize(nacionalidad),
    genero: capitalize(genero),
    indigena: capitalize(indigena),
    fecha_nacimiento,
  });

  if (!validationResult.success) {
    console.error("Error al validar los datos:", validationResult.error);

    const errors = validationResult.error.issues;

    const fieldErrors = errors.map((error) => {
      const issuePath = error.path as PropertyKey[];
      const field = issuePath.map(String).join(".");

      if (field.includes("nacionalidad")) {
        return "El valor de nacionalidad ingresado es incorrecto. Debe ser 'Chilena' o 'Extranjera'.";
      }
      if (field.includes("genero")) {
        return "El valor de género ingresado es incorrecto. Debe ser 'Femenino' o 'Masculino'.";
      }
      if (field.includes("indigena")) {
        return "El valor de indígena ingresado es incorrecto. Debe ser 'Si' o 'No'.";
      }
      if (field.includes("fecha_nacimiento")) {
        return "La fecha de nacimiento ingresada es inválida o no ingresada.";
      }

      // Fallback: mensaje nativo de Zod
      return error.message;
    });

    return {
      success: false,
      message: fieldErrors[0] || "Se encontraron errores de validación.",
      errors: fieldErrors,
    };
  }

  const formatedRut = formatRUT(rut);

  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

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

      // Normalizar valores a null si vienen vacíos
      const nacionalidadParam =
        validationResult.data.nacionalidad &&
        validationResult.data.nacionalidad.trim() !== ""
          ? validationResult.data.nacionalidad
          : null;
      const generoParam =
        validationResult.data.genero &&
        validationResult.data.genero.trim() !== ""
          ? validationResult.data.genero
          : null;
      const indigenaParam =
        validationResult.data.indigena &&
        validationResult.data.indigena.trim() !== ""
          ? validationResult.data.indigena
          : null;

      const updateRshRequest = new sql.Request(transaction);
      await updateRshRequest
        .input("rut", sql.Int, validationResult.data.rut)
        .input("nacionalidad", sql.VarChar, nacionalidadParam)
        .input("genero", sql.VarChar, generoParam)
        .input("indigena", sql.VarChar, indigenaParam)
        .input(
          "fecha_nacimiento",
          sql.DateTime,
          validationResult.data.fecha_nacimiento ?? null,
        ).query(`
            UPDATE rsh
            SET
              nacionalidad   = COALESCE(@nacionalidad, nacionalidad),
              genero         = COALESCE(@genero, genero),
              indigena       = COALESCE(@indigena, indigena),
              fecha_nacimiento = COALESCE(@fecha_nacimiento, fecha_nacimiento)
            WHERE rut = @rut
          `);

      await transaction.commit();
      await logAction("Editar", "editó el RSH", formatedRut, formatedRut);
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

// Update RSH Name
const RSHUpdateNameFormSchema = z.object({
  rut: z
    .string()
    .min(7, { message: "RUT debe tener al menos 7 dígitos" })
    .regex(/^\d+$/, { message: "RUT debe contener solo números" }),
  nombres: z
    .string()
    .min(3, { message: "Nombres deben tener al menos 3 caracteres" }),
  apellidos: z
    .string()
    .min(3, { message: "Apellidos deben tener al menos 3 caracteres" }),
});

export async function updateRSHName(formData: FormData) {
  const rut = formData.get("rut") as string;
  const nombres = formData.get("nombres_rsh") as string;
  const apellidos = formData.get("apellidos_rsh") as string;

  const validationResult = RSHUpdateNameFormSchema.safeParse({
    rut: rut,
    nombres: capitalizeAll(nombres),
    apellidos: capitalizeAll(apellidos),
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
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

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

      const updateRshRequest = new sql.Request(transaction);
      await updateRshRequest
        .input("rut", sql.Int, validationResult.data.rut)
        .input("nombres_rsh", sql.VarChar, validationResult.data.nombres)
        .input("apellidos_rsh", sql.VarChar, validationResult.data.apellidos)
        .query(`
            UPDATE rsh
            SET
              nombres_rsh = @nombres_rsh,
              apellidos_rsh = @apellidos_rsh
            WHERE rut = @rut
          `);

      await transaction.commit();
      await logAction("Editar", "editó el nombre de", formatedRut);
      revalidatePath(`/dashboard/entregas/${rut}`);
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

// Update Tramo RSH
const RSHUpdateTramoFormSchema = z.object({
  rut: z
    .string()
    .min(7, { message: "RUT debe tener al menos 7 dígitos" })
    .regex(/^\d+$/, { message: "RUT debe contener solo números" }),
  tramo: z.enum(["40", "50", "60", "70", "80", "90", "100"], {
    message:
      "Tramo debe ser uno de los valores permitidos: 40, 50, 60, 70, 80, 90 o 100",
  }),
});

export async function updateTramo(formData: FormData) {
  const rut = formData.get("rut") as string;
  const tramo = formData.get("tramo") as string;

  const validationResult = RSHUpdateTramoFormSchema.safeParse({
    rut,
    tramo: tramo.trim(),
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
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

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

      const updateRshRequest = new sql.Request(transaction);
      await updateRshRequest
        .input("rut", sql.Int, validationResult.data.rut)
        .input("tramo", sql.VarChar, validationResult.data.tramo).query(`
            UPDATE rsh
            SET
              tramo = @tramo
            WHERE rut = @rut
          `);

      await transaction.commit();
      await logAction("Editar", "editó el tramo de", formatedRut);
      revalidatePath(`/dashboard/entregas/${rut}`);
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
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

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

      // Obtener todas las entregas asociadas al usuario
      const entregasRequest = new sql.Request(transaction);
      const entregasResult = await entregasRequest.input("rut", sql.Int, rut)
        .query(`
          SELECT 1 FROM entregas WHERE rut = @rut
        `);

      if (entregasResult.recordset.length > 0) {
        await transaction.rollback();
        return {
          success: false,
          message: `No se puede eliminar el registro ${formatRUT(rut)} porque tiene entregas asociadas.`,
        };
      }

      const deleteRshRequest = new sql.Request(transaction);
      await deleteRshRequest
        .input("rut", sql.Int, rut)
        .query(`DELETE FROM rsh WHERE rut = @rut`);

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
    console.error("Error al eliminar RSH:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
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

// Validación Zod - Modified to work with Blob instead of File
const FileSchema = z.object({
  file: z.any().refine(
    (file) => {
      // Check if it's a Blob (which includes File in browser environments)
      return file instanceof Blob && file.size > 0;
    },
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
    const fileData = formData.get("file");

    if (!fileData) {
      return {
        success: false,
        message: "No se ha seleccionado ningún archivo.",
      };
    }

    // Validate the file data
    FileSchema.parse({ file: fileData });

    // Convert the file data to a buffer that ExcelJS can work with
    const arrayBuffer = await (fileData as Blob).arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const worksheet = workbook.worksheets[0];

    const citizens: CitizenData[] = [];
    let validRows = 0;
    let skippedRows = 0;

    const columnMapping: { [key: string]: number } = {};
    let headersProcessed = false;

    worksheet.eachRow((row, rowNumber) => {
      const values = row.values as ExcelJS.CellValue[];

      if (rowNumber === 1) {
        values.forEach((header, index) => {
          if (header && typeof header === "string") {
            const normalizedHeader = header
              .toString()
              .toLowerCase()
              .trim()
              .replace(/\s+/g, "_");

            columnMapping[normalizedHeader] = index;
          }
        });
        headersProcessed = true;
        console.log("Headers encontrados:", Object.keys(columnMapping));
        return;
      }

      if (!headersProcessed) {
        throw new Error("No se pudieron procesar las cabeceras del archivo");
      }

      // Helper function to get value by header name
      const getValueByHeader = (headerName: string): string => {
        const columnIndex =
          columnMapping[headerName.toLowerCase().replace(/\s+/g, "_")];

        if (columnIndex === undefined) return "";
        // Special handling for 'dv' field - "0" is a valid value
        if (headerName === "dv") {
          return values[columnIndex] !== undefined &&
            values[columnIndex] !== null
            ? String(values[columnIndex])
            : "";
        }
        // For other fields, check for falsy values but allow "0" as a valid value
        if (
          values[columnIndex] === undefined ||
          values[columnIndex] === null ||
          values[columnIndex] === ""
        ) {
          return "";
        }
        return String(values[columnIndex]);
      };

      const rawRut = getValueByHeader("run") || getValueByHeader("rut");
      if (!rawRut) {
        skippedRows++;
        console.log("Row skipped:", rowNumber);
        return;
      }

      // Procesar campos usando headers
      const apellidopaterno = getValueByHeader("apellidopaterno")
        ? capitalizeWords(getValueByHeader("apellidopaterno"))
        : "";
      const apellidomaterno = getValueByHeader("apellidomaterno")
        ? capitalizeWords(getValueByHeader("apellidomaterno"))
        : null;
      const calle = getValueByHeader("n_calle_uni_rsh")
        ? capitalizeAll(getValueByHeader("n_calle_uni_rsh"))
        : "";
      const numcalle = getValueByHeader("numdomicilio") ?? null;
      const sector = getValueByHeader("c_ah_nom")
        ? capitalizeAll(getValueByHeader("c_ah_nom"))
        : "";
      const citizen: CitizenData = {
        rut: rawRut,
        dv: getValueByHeader("dv"),
        nombres_rsh: getValueByHeader("nombres")
          ? capitalizeAll(getValueByHeader("nombres"))
          : "",
        apellidopaterno,
        apellidomaterno,
        apellidos_rsh: `${apellidopaterno} ${apellidomaterno || ""}`.trim(),
        telefono: getValueByHeader("telefono"),
        correo: getValueByHeader("email"),
        indigena:
          getValueByHeader("indigena") === null ||
          getValueByHeader("indigena") === undefined ||
          getValueByHeader("indigena") === "" ||
          isNaN(Number(getValueByHeader("indigena")))
            ? null
            : parseInt(String(getValueByHeader("indigena")), 10) === 0
              ? "No"
              : "Si",
        genero:
          Number(getValueByHeader("sexo")) === 1 ? "Masculino" : "Femenino",
        nacionalidad:
          getValueByHeader("nacionalidad_id") &&
          Number(getValueByHeader("nacionalidad_id")) === 1
            ? "Chilena"
            : getValueByHeader("nacionalidad_id") &&
                Number(getValueByHeader("nacionalidad_id")) === 2
              ? "Extranjera"
              : null,
        sector: sector
          ? sector.length > 3
            ? sector.substring(0, sector.length - 3)
            : sector
          : null,
        direccion: `${calle} ${numcalle}`.trim(),
        tramo: getValueByHeader("tramo")
          ? String(getValueByHeader("tramo"))
          : "",
        folio: getValueByHeader("nuevofolio")
          ? String(getValueByHeader("nuevofolio"))
          : "",
        fecha_nacimiento: convertDate(getValueByHeader("fechanacimiento")),
        fecha_encuesta: convertDate(getValueByHeader("fecha_encuesta")),
        fecha_modificacion: convertDate(getValueByHeader("fecha_modificacion")),
        fecha_calificacion: convertDate(getValueByHeader("fecha_calificacion")),
      };

      if (!citizen.rut || !citizen.nombres_rsh || !citizen.apellidopaterno) {
        skippedRows++;
        return;
      }
      citizens.push(citizen);
      validRows++;
    });

    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

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
              tvp.columns.add("telefono", sql.VarChar(15), { nullable: true });
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
                ) {
                  skippedRows++;
                  continue;
                }

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
            tvp.columns.add("telefono", sql.VarChar(15), { nullable: true });
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
              ) {
                skippedRows++;
                continue;
              }

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
        console.log(`Procesadas ${validRows} filas, (${skippedRows} omitidas)`);
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
      message: `Procesadas ${validRows} filas, (${skippedRows} omitidas)`,
    };
  } catch (error) {
    console.error("Error en importación:", error);
    return {
      success: false,
      message: `Error al procesar archivo: ${error instanceof Error ? error.message : "Error desconocido"}`,
    };
  }
}
