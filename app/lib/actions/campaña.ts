"use server";
import { z } from "zod";
// import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { FormState } from "../../ui/dashboard/campañas/new-campaign-modal";
import { connectToDB } from "../utils/db-connection";
import sql from "mssql";
import { Campaign } from "../definitions";
import { logAction } from "./auditoria";
import { capitalizeAll } from "../utils/format";

// const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Crear Campaña ========================================================================
const CreateCampaignFormSchema = z.object({
  id: z.string(),
  nombre: z.string().min(3, { message: "Nombre es requerido" }),
  fechaInicio: z.string(),
  fechaTermino: z.string(),
  estado: z.enum(["En curso", "Finalizado"]),
  code: z.string(),
  stock: z.string().transform((str) => Number(str)),
  entregas: z.number(),
  tipoDato: z.string(),
  tramo: z.string().transform((str) => str === "true"),
  discapacidad: z.string().transform((str) => str === "true"),
  adultoMayor: z.string().transform((str) => str === "true"),
});

const CreateCampaign = CreateCampaignFormSchema.omit({
  id: true,
  fechaInicio: true,
  estado: true,
  entregas: true,
})
  .partial()
  .required({
    nombre: true,
    fechaTermino: true,
    code: true,
    stock: true,
    tipoDato: true,
    tramo: true,
    discapacidad: true,
    adultoMayor: true,
  });
// Add return type to the server action
export async function createCampaign(formData: FormData): Promise<FormState> {
  try {
    const {
      nombre,
      fechaTermino,
      code,
      stock,
      tipoDato,
      tramo,
      discapacidad,
      adultoMayor,
    } = CreateCampaign?.parse({
      nombre: formData.get("nombre"),
      fechaTermino: formData.get("fechaTermino"),
      code: formData.get("code"),
      stock: formData.get("stock"),
      tipoDato: formData.get("tipoDato"),
      tramo: formData.get("tramo"),
      discapacidad: formData.get("discapacidad"),
      adultoMayor: formData.get("adultoMayor"),
    });

    const fechaInicio = new Date();

    if (!fechaTermino) {
      throw new Error("Campos incompletos.");
    }

    if (new Date(fechaTermino) < fechaInicio) {
      throw new Error(
        "La fecha de término no puede ser menor a la fecha de inicio.",
      );
    }

    // Buscar coincidencias en la base de datos
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request.input("nombre", sql.NVarChar, nombre).query(`
        SELECT *,
          CASE 
            WHEN campañas.fecha_inicio > GETUTCDATE() THEN 'Pendiente'
            WHEN campañas.fecha_inicio <= GETUTCDATE() AND campañas.fecha_termino >= GETUTCDATE() THEN 'En Curso'
            ELSE 'Finalizado'
          END AS estado
        FROM campañas
        WHERE nombre_campaña = @nombre
      `);

    // Verificar que no hayan campañas activas con el mismo nombre
    const campañas = result.recordset as Campaign[];
    for (const campaña of campañas) {
      if (campaña.estado !== "Finalizado")
        throw new Error("Ya existe una campaña activa con este nombre.");
    }

    const entregas = 0;

    // Modified query to return the inserted ID
    const insertResult = await request
      .input("nombre_campaña", sql.NVarChar, nombre)
      .input(
        "fechaTermino",
        sql.DateTime,
        new Date(new Date(fechaTermino).toISOString()),
      )
      .input("code", sql.NVarChar, code.toUpperCase())
      .input("stock", sql.Int, stock)
      .input("tipoDato", sql.NVarChar, tipoDato)
      .input("entregas", sql.Int, entregas)
      .input("tramo", sql.Bit, tramo)
      .input("discapacidad", sql.Bit, discapacidad)
      .input("adultoMayor", sql.Bit, adultoMayor).query(`
        INSERT INTO campañas (nombre_campaña, fecha_inicio, fecha_termino, code, stock, tipo_dato, entregas, tramo, discapacidad, adulto_mayor)
        OUTPUT INSERTED.id
        VALUES (@nombre_campaña, GETUTCDATE(), @fechaTermino, @code, @stock, @tipoDato, @entregas, @tramo, @discapacidad, @adultoMayor)
        `);

    // Get the ID from the result
    const newCampaignId = insertResult.recordset[0].id;

    await logAction("Crear", "creó la campaña", nombre, newCampaignId);
    revalidatePath("/dashboard/campanas");
    return { success: true, message: "Campaña creada exitosamente." };
  } catch (error) {
    console.error(error || "Error al crear la campaña.");
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

// Editar Campaña =================================================================================
const UpdateCampaignFormSchema = z.object({
  id: z.string(),
  nombre_campaña: z.string().min(3, { message: "Nombre es requerido" }),
  fechaInicio: z.string(),
  fechaTermino: z.string(),
  tipoDato: z.string(),
  addStock: z
    .string()
    .transform((str) => (str && str.trim() !== "" ? Number(str) : 0))
    .optional(),
  tramo: z.string().transform((str) => str === "true"),
  discapacidad: z.string().transform((str) => str === "true"),
  adultoMayor: z.string().transform((str) => str === "true"),
});

export async function updateCampaign(id: string, formData: FormData) {
  try {
    const nombre_campaña = formData.get("nombre") as string;
    const fechaInicio = formData.get("fechaInicio") as string;
    const fechaTermino = formData.get("fechaTermino") as string;
    const tipoDato = formData.get("tipoDato") as string;
    const addStock = formData.get("addStock") as string;
    const tramo = formData.get("tramo") as string;
    const discapacidad = formData.get("discapacidad") as string;
    const adultoMayor = formData.get("adultoMayor") as string;

    if (!fechaInicio || !fechaTermino)
      return {
        success: false,
        message: "Campos incompletos",
      };

    const validationResult = UpdateCampaignFormSchema.safeParse({
      id,
      nombre_campaña: capitalizeAll(nombre_campaña),
      fechaInicio: fechaInicio
        ? new Date(fechaInicio).toISOString()
        : undefined,
      fechaTermino: fechaTermino
        ? new Date(fechaTermino).toISOString()
        : undefined,
      tipoDato,
      addStock,
      tramo,
      discapacidad,
      adultoMayor,
    });

    if (!validationResult.success) {
      return {
        success: false,
        message: validationResult.error.errors[0].message,
      };
    }

    if (new Date(fechaTermino) < new Date(fechaInicio)) {
      return {
        success: false,
        message: "La fecha de término no puede ser menor a la fecha de inicio.",
      };
    }

    const pool = await connectToDB();
    const checkRequest = pool.request();
    const checkResult = await checkRequest.input("id", sql.UniqueIdentifier, id)
      .query(`
        SELECT stock
        FROM campañas
        WHERE id = @id
      `);

    if (checkResult.recordset.length === 0) {
      return { success: false, message: "No se encontró la campaña." };
    }

    const stockToAdd = validationResult.data.addStock || 0;
    const updatedStock =
      stockToAdd > 0
        ? checkResult.recordset[0].stock + stockToAdd
        : checkResult.recordset[0].stock;

    // Create a new request for the update operation
    const updateRequest = new sql.Request(pool);
    await updateRequest
      .input("id", sql.UniqueIdentifier, id)
      .input("nombre_campaña", sql.VarChar, nombre_campaña)
      .input(
        "fecha_inicio",
        sql.DateTime,
        new Date(new Date(fechaInicio).toISOString()),
      )
      .input(
        "fecha_termino",
        sql.DateTime,
        new Date(new Date(fechaTermino).toISOString()),
      )
      .input("tipo_dato", sql.VarChar, tipoDato)
      .input("updatedStock", sql.Int, updatedStock)
      .input("tramo", sql.Bit, tramo === "true")
      .input("discapacidad", sql.Bit, discapacidad === "true")
      .input("adulto_mayor", sql.Bit, adultoMayor === "true").query(`
        UPDATE campañas
        SET nombre_campaña = @nombre_campaña,
            fecha_inicio = @fecha_inicio,
            fecha_termino = @fecha_termino,
            tipo_dato = @tipo_dato,
            stock = @updatedStock,
            tramo = @tramo,
            discapacidad = @discapacidad,
            adulto_mayor = @adulto_mayor
        WHERE id = @id
        `);

    await logAction("Editar", "editó la campaña", nombre_campaña, id);
    revalidatePath("/dashboard/campanas");
    return { success: true, message: "Campaña actualizada exitosamente." };
  } catch (error) {
    console.error("Error al actualizar la campaña:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error al actualizar la campaña",
    };
  }
}

// Eliminar Campaña ===============================================================================
export async function deleteCampaign(id: string) {
  try {
    const pool = await connectToDB();
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const campaignRequest = new sql.Request(transaction);
      const campaignResult = await campaignRequest.input(
        "id",
        sql.UniqueIdentifier,
        id,
      ).query(`
        SELECT *
        FROM campañas
        WHERE id = @id
      `);

      if (campaignResult.recordset.length === 0) {
        await transaction.rollback();
        return { success: false, message: "No se encontró la campaña." };
      }

      const deleteCampaignRequest = new sql.Request(transaction);
      await deleteCampaignRequest.input("id", sql.UniqueIdentifier, id).query(`
        DELETE FROM campañas
        WHERE id = @id
      `);

      await transaction.commit();

      await logAction(
        "Eliminar",
        "eliminó la campaña",
        campaignResult.recordset[0].nombre_campaña,
        id,
      );
      revalidatePath("/dashboard/campanas");
      return { success: true, message: "Campaña eliminada exitosamente." };
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al eliminar la campaña:", error);
    return {
      success: false,
      message: "Error al eliminar la campaña.",
    };
  }
}

// Terminar Campaña
export async function endCampaignById(id: string) {
  try {
    const pool = await connectToDB();
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();
      const campaignRequest = new sql.Request(transaction);
      const campaignResult = await campaignRequest.input(
        "id",
        sql.UniqueIdentifier,
        id,
      ).query(`
          SELECT *,
                CASE 
                  WHEN fecha_termino < GETUTCDATE() THEN 1
                  ELSE 0
                END AS is_finished
          FROM campañas
          WHERE id = @id
        `);

      if (campaignResult.recordset.length === 0) {
        await transaction.rollback();
        return { success: false, message: "No se encontró la campaña." };
      }

      if (campaignResult.recordset[0].is_finished) {
        await transaction.rollback();
        return { success: false, message: "La campaña ya está finalizada." };
      }

      const endCampaignRequest = new sql.Request(transaction);
      await endCampaignRequest.input("id", sql.UniqueIdentifier, id).query(`
        UPDATE campañas
        SET fecha_termino = GETUTCDATE()
        WHERE id = @id
      `);

      await transaction.commit();

      await logAction(
        "Editó",
        "finalizó la campaña",
        campaignResult.recordset[0].nombre_campaña,
        id,
      );
      revalidatePath("/dashboard/campanas");
      return { success: true, message: "Campaña finalizada exitosamente." };
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al finalizar la campaña:", error);
    return {
      success: false,
      message: "Error al finalizar la campaña.",
    };
  }
}
