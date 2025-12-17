"use server";
import sql from "mssql";
import { z } from "zod";
import { PDFDocument } from "pdf-lib";
import fs from "fs";
import path from "path";
import { compressPdfBuffer } from "../utils/pdf-compress";
import { connectToDB } from "../utils/db-connection";
import { logAction } from "./auditoria";
import { formatDate, formatPhone, formatRUT } from "../utils/format";
import { getSession } from "../session";
import { revalidatePath } from "next/cache";
import { getDV } from "../utils/get-values";

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

// Crear Entrega Rapida y para Tercero
const CreateEntregaFormSchema = z.object({
  rut: z.string().min(1, { message: "RUT es requerido" }),
  observaciones: z.string().optional(),
  // Validación de Campañas adaptada a la nueva estructura JSON
  campaigns: z.string().transform((str) => {
    try {
      const parsed = JSON.parse(str);
      const itemSchema = z.object({
        id: z.string(),
        campaignName: z.string(),
        campos_adicionales: z.string(), // El JSON string generado por el frontend
        code: z.string().optional(), // Código rápido (ej: N° Vale)
      });
      return z.array(itemSchema).parse(parsed);
    } catch {
      return [];
    }
  }),
  // Campos opcionales del Receptor (Tercero)
  rut_receptor: z.string().optional(),
  nombres_receptor: z.string().optional(),
  apellidos_receptor: z.string().optional(),
  telefono_receptor: z.string().optional(),
  direccion_receptor: z.string().optional(),
  parentesco_receptor: z.string().optional(),
});

export const createEntrega = async (
  userIdFromSession: string,
  formData: FormData,
) => {
  const result = CreateEntregaFormSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!result.success) {
    console.error("Error validación Zod:", result.error);
    return { success: false, message: "Datos de entrada inválidos." };
  }

  const {
    rut,
    campaigns,
    observaciones,
    rut_receptor,
    nombres_receptor,
    apellidos_receptor,
    telefono_receptor,
    direccion_receptor,
    parentesco_receptor,
  } = result.data;

  let logComment = "";

  if (campaigns.length === 0) {
    return { success: false, message: "Debe seleccionar al menos una campaña" };
  }

  if (rut_receptor && rut_receptor.length > 5) {
    const cleanRut = rut_receptor
      .replace(/\./g, "")
      .replace(/-/g, "")
      .toUpperCase();
    const dvReceptor = cleanRut.slice(-1);
    const numRutReceptor = parseInt(cleanRut.slice(0, -1));
    const checkDV = getDV(numRutReceptor);
    if (checkDV !== dvReceptor) {
      return {
        success: false,
        message: "El DV no coincide con el RUT",
      };
    }
  }

  const folioCode =
    campaigns.length > 1 ? "DO" : campaigns[0].code?.substring(0, 2) || "DO";
  let newFolio = "";

  try {
    const pool = await connectToDB();
    if (!pool)
      return {
        success: false,
        message: "Error de conexión a la base de datos.",
      };

    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      // 2. Verificar Duplicidad Diaria
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const dailyCheckRequest = new sql.Request(transaction);
      const dailyCheckResult = await dailyCheckRequest
        .input("rut", sql.Int, rut)
        .input("startDate", sql.DateTime, startOfDay)
        .input("endDate", sql.DateTime, endOfDay).query(`
          SELECT COUNT(*) as count 
          FROM entregas
          WHERE rut = @rut 
            AND fecha_entrega BETWEEN @startDate AND @endDate 
            AND estado_documentos <> 'Anulado'
        `);

      if (dailyCheckResult.recordset[0].count > 0) {
        throw new Error("Esta persona ya recibió un beneficio el día de hoy.");
      }

      // 2.5. VALIDACIÓN TEMPORAL: Edad para Regalo de Navidad (< 13 años)
      const hasChristmasCampaign = campaigns.some((c) =>
        c.campaignName.toLowerCase().includes("regalo de navidad"),
      );

      if (hasChristmasCampaign) {
        const rshRequest = new sql.Request(transaction);
        const rshResult = await rshRequest.input("rut", sql.Int, rut).query(`
             SELECT fecha_nacimiento FROM rsh WHERE rut = @rut
        `);

        if (rshResult.recordset.length > 0) {
          const fechaNacimiento = rshResult.recordset[0].fecha_nacimiento;

          if (fechaNacimiento) {
            const birthDate = new Date(fechaNacimiento);
            const today = new Date();

            // Cálculo preciso de edad
            let age = today.getFullYear() - birthDate.getUTCFullYear();
            const m = today.getMonth() - birthDate.getUTCMonth();
            if (
              m < 0 ||
              (m === 0 && today.getDate() < birthDate.getUTCDate())
            ) {
              age--;
            }

            console.log("Validación Edad:", {
              nacimientoUTC: birthDate.toISOString(),
              diaNacimientoRecuperado: birthDate.getUTCDate(),
              diaHoy: today.getDate(),
              edadCalculada: age,
            });

            // Validar: Debe ser menor de 13 (0 a 12 años)
            // Si tiene 13 o más, lanzamos error.
            if (age >= 13) {
              throw new Error(
                `El beneficiario tiene ${age} años. La campaña "Regalo de Navidad" es exclusiva para menores de 13 años.`,
              );
            }
          } else {
            throw new Error(
              "El beneficiario no tiene fecha de nacimiento registrada en RSH para validar la edad.",
            );
          }
        } else {
          throw new Error(
            "Beneficiario no encontrado en RSH para validar edad.",
          );
        }
      }

      // 3. Generar Folio Automático (Usando la SIGLA correcta)
      const currentYearTwoDigits = new Date().getFullYear() % 100;

      const spRequest = new sql.Request(transaction);
      spRequest.input("p_rut", sql.Int, rut);
      spRequest.input("p_observacion", sql.NVarChar, observaciones || "");
      spRequest.input("p_id_usuario", sql.UniqueIdentifier, userIdFromSession);
      spRequest.input("p_current_year", sql.Int, currentYearTwoDigits);
      spRequest.input("p_code", sql.VarChar, folioCode); // Aquí va "PA", "GA", etc.
      spRequest.output("p_new_folio_output", sql.VarChar);

      const spResult = await spRequest.execute("dbo.GenerateAndInsertEntrega");
      newFolio = spResult.output.p_new_folio_output;

      if (!newFolio) throw new Error("No se pudo generar el folio.");

      // 4. Lógica de Receptor (Terceros)
      if (rut_receptor && rut_receptor.length > 5) {
        logComment = "realizó una entrega a tercero";
        const cleanRut = rut_receptor
          .replace(/\./g, "")
          .replace(/-/g, "")
          .toUpperCase();
        const dvReceptor = cleanRut.slice(-1);
        const numRutReceptor = parseInt(cleanRut.slice(0, -1));

        const checkReceptorReq = new sql.Request(transaction);
        const existingReceptor = await checkReceptorReq
          .input("rut", sql.Int, numRutReceptor)
          .query("SELECT id FROM receptores WHERE rut = @rut");

        let idReceptor: number;

        if (existingReceptor.recordset.length > 0) {
          idReceptor = existingReceptor.recordset[0].id;
        } else {
          const createReceptorReq = new sql.Request(transaction);
          const insertReceptor = await createReceptorReq
            .input("rut", sql.Int, numRutReceptor)
            .input("dv", sql.Char(1), dvReceptor)
            .input("nombres", sql.VarChar(50), nombres_receptor)
            .input("apellidos", sql.VarChar(50), apellidos_receptor)
            .input(
              "telefono",
              sql.VarChar(20),
              telefono_receptor ? telefono_receptor : null,
            )
            .input(
              "direccion",
              sql.VarChar(100),
              direccion_receptor ? direccion_receptor : null,
            ).query(`
              INSERT INTO receptores (rut, dv, nombres, apellidos, telefono, direccion)
              OUTPUT INSERTED.id
              VALUES (@rut, @dv, @nombres, @apellidos, @telefono, @direccion)
            `);
          idReceptor = insertReceptor.recordset[0].id;
        }

        const linkReceptorReq = new sql.Request(transaction);
        await linkReceptorReq
          .input("folio", sql.VarChar(50), newFolio)
          .input("id_receptor", sql.Int, idReceptor)
          .input(
            "parentesco",
            sql.VarChar(200),
            parentesco_receptor || "No informado",
          ).query(`
            INSERT INTO entregas_receptores (folio_entrega, id_receptor, parentesco)
            VALUES (@folio, @id_receptor, @parentesco)
          `);
      }

      // 5. Insertar Detalles de Campañas (Beneficios Entregados)
      for (const item of campaigns) {
        // Parsear el JSON para extraer el código físico real
        let realCodigoEntrega: string | null = null;
        let finalJsonString = item.campos_adicionales; // JSON final a guardar
        try {
          const data = JSON.parse(item.campos_adicionales);
          // Buscamos si existe la clave "codigo_serial" en el JSON
          if (data && data.codigo_entrega) {
            realCodigoEntrega = String(data.codigo_entrega).toUpperCase();
            data.codigo_entrega = realCodigoEntrega;
            finalJsonString = JSON.stringify(data);
          }
        } catch (e) {
          console.error("Error parseando JSON en server action", e);
        }

        const insertItemReq = new sql.Request(transaction);
        await insertItemReq
          .input("folio", sql.VarChar(50), newFolio)
          .input("id_campana", sql.UniqueIdentifier, item.id)
          .input("codigo_entrega", sql.VarChar(100), realCodigoEntrega)
          .input("campos_adicionales", sql.NVarChar(sql.MAX), finalJsonString)
          .query(`
            INSERT INTO beneficios_entregados (folio, id_campaña, codigo_entrega, campos_adicionales)
            VALUES (@folio, @id_campana, @codigo_entrega, @campos_adicionales)
          `);

        // Descontar Stock
        const updateStockReq = new sql.Request(transaction);
        await updateStockReq
          .input("id", sql.UniqueIdentifier, item.id)
          .query(`UPDATE campañas SET entregas = entregas + 1 WHERE id = @id`);
      }

      await transaction.commit();
      await logAction(
        "Crear",
        logComment !== "" ? logComment : "realizó una entrega rápida",
        `Folio: ${newFolio}`,
        userIdFromSession,
      );
      revalidatePath("/dashboard/entregas");

      return {
        success: true,
        message: `Entrega registrada exitosamente. Folio: ${newFolio}`,
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("Error en createEntrega:", error);

    // Manejo de errores SQL específicos (ej: Deadlock)
    const sqlErrNumber = (
      error as { originalError?: { info?: { number?: number } } }
    ).originalError?.info?.number;
    if (sqlErrNumber === 1205) {
      return {
        success: false,
        message: "Conflicto de concurrencia. Intente nuevamente.",
      };
    }

    const msg =
      error instanceof Error
        ? error.message
        : "Error desconocido al procesar la entrega.";
    return { success: false, message: msg };
  }
};

// Entrega Manual
const CreateEntregaManualSchema = z.object({
  rut: z.string().min(1),
  observaciones: z.string().optional(),
  folio: z.string().min(2, { message: "Folio es requerido" }),
  fecha_entrega: z.string().min(1, { message: "Fecha es requerida" }),
  correo_encargado: z.string().email(),
  campaigns: z.string().transform((str) => {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  }),
});

export const createEntregaManual = async (formData: FormData) => {
  const result = CreateEntregaManualSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!result.success) {
    return { success: false, message: "Datos inválidos en entrega manual." };
  }

  const {
    rut,
    campaigns,
    observaciones,
    folio,
    fecha_entrega,
    correo_encargado,
  } = result.data;

  try {
    const pool = await connectToDB();
    if (!pool)
      return { success: false, message: "Sin conexión a base de datos." };

    const transaction = new sql.Transaction(pool);
    await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

    try {
      // 1. Obtener ID del Usuario Encargado (por correo)
      const userReq = new sql.Request(transaction);
      const userRes = await userReq
        .input("correo", sql.VarChar, correo_encargado)
        .query("SELECT id FROM usuarios WHERE correo = @correo");

      if (userRes.recordset.length === 0) {
        throw new Error("El correo del funcionario no está registrado.");
      }
      const userId = userRes.recordset[0].id;

      // 2. Verificar que el Folio NO exista
      const checkFolioReq = new sql.Request(transaction);
      const checkFolioRes = await checkFolioReq
        .input("folio", sql.VarChar, folio)
        .query("SELECT folio FROM entregas WHERE folio = @folio");

      if (checkFolioRes.recordset.length > 0) {
        throw new Error("Este Folio ya existe en el sistema.");
      }

      // 3. Insertar en Tabla Entregas (Manual)
      const insertEntregaReq = new sql.Request(transaction);
      await insertEntregaReq
        .input("folio", sql.VarChar(50), folio.toUpperCase())
        .input("observacion", sql.NVarChar, observaciones || "")
        .input("fecha_entrega", sql.DateTime, new Date(fecha_entrega)) // Usamos la fecha manual
        .input("rut", sql.Int, rut)
        .input("id_usuario", sql.UniqueIdentifier, userId).query(`
          INSERT INTO entregas (folio, observacion, fecha_entrega, rut, id_usuario)
          VALUES (@folio, @observacion, @fecha_entrega, @rut, @id_usuario)
        `);

      // 4. Insertar Beneficios e Impactar Stock
      for (const item of campaigns) {
        const insertItemReq = new sql.Request(transaction);
        await insertItemReq
          .input("folio", sql.VarChar(50), folio.toUpperCase())
          .input("id_campana", sql.UniqueIdentifier, item.id)
          .input("codigo_entrega", sql.VarChar(100), item.code || null)
          .input(
            "campos_adicionales",
            sql.NVarChar(sql.MAX),
            item.campos_adicionales,
          ) // JSON
          .query(`
            INSERT INTO beneficios_entregados (folio, id_campaña, codigo_entrega, campos_adicionales)
            VALUES (@folio, @id_campana, @codigo_entrega, @campos_adicionales)
          `);

        const updateStockReq = new sql.Request(transaction);
        await updateStockReq.input("id", sql.UniqueIdentifier, item.id).query(`
            UPDATE campañas SET entregas = entregas + 1 WHERE id = @id
        `);
      }

      await transaction.commit();

      await logAction(
        "Crear",
        "registró entrega manual",
        `Folio: ${folio}`,
        folio,
      );
      revalidatePath("/dashboard/entregas");

      return {
        success: true,
        message: "Entrega manual registrada correctamente.",
      };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error("Error en createEntregaManual:", error);
    const msg = error instanceof Error ? error.message : "Error desconocido.";
    return { success: false, message: msg };
  }
};

// Editar Entrega ================================================================================= (pendiente)

export const updateJustificationByFolio = async (
  folio: string,
  formData: FormData,
) => {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    const justification = formData.get("justification");
    if (!justification) {
      return { success: false, message: "Justificación es requerida" };
    }

    const folioRequest = pool.request();
    const folioResult = await folioRequest.input("folio", sql.NVarChar, folio)
      .query(`
        SELECT folio FROM entregas WHERE folio = @folio
      `);

    if (folioResult.recordset.length === 0) {
      return { success: false, message: "Entrega no encontrada" };
    }

    const updateRequest = pool.request();
    await updateRequest
      .input("justification", sql.NVarChar, justification)
      .input("folio", sql.NVarChar, folio).query(`
        UPDATE entregas
        SET observacion = @justification
        WHERE folio = @folio
      `);

    await logAction(
      "Editar",
      "cambió la justificación de la entrega",
      folio,
      folio,
    );

    return { success: true, message: "Justificación actualizada" };
  } catch (error) {
    console.error("Error al actualizar justificacion:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

// Actualizar encargado de entrega mediante folio
export const updateSupervisorByFolio = async (
  folio: string,
  formData: FormData,
) => {
  const correoRaw = formData.get("supervisor");
  const correo = typeof correoRaw === "string" ? correoRaw.trim() : "";

  if (!folio || !correo) {
    return {
      success: false,
      message: "Campos incompletos",
    };
  }

  const userSession = await getSession();
  if (!userSession?.userId) {
    return {
      success: false,
      message: "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.",
    };
  }
  const userId = String(userSession?.userId);

  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        success: false,
        message: "No se pudo establecer una conexión a la base de datos.",
      };
    }

    // Verificar si el usuario tiene permisos para actualizar el encargado
    const checkPermissionRequest = new sql.Request(pool);
    const checkPermissionResult = await checkPermissionRequest.input(
      "userId",
      sql.VarChar,
      userId,
    ).query(`
          SELECT id FROM usuarios WHERE id = @userId AND rol = 'Administrador'
        `);
    if (checkPermissionResult.recordset.length === 0) {
      return {
        success: false,
        message: "No tienes permisos para actualizar el encargado.",
      };
    }

    // Verificar si existe el correo del encargado
    const correoRequest = new sql.Request(pool);
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
    const supervisorId = String(correoResult.recordset[0].id);

    // Actualizar el encargado en la tabla entregas
    const updateUserIdRequest = new sql.Request(pool);
    await updateUserIdRequest
      .input("folio", sql.VarChar, folio)
      .input("supervisorId", sql.VarChar, supervisorId).query(`
          UPDATE entregas SET id_usuario = @supervisorId WHERE folio = @folio
        `);

    await logAction(
      "Actualizar",
      "actualizó el encargado de la entrega",
      folio,
      folio,
    );
    return { success: true, message: "Encargado actualizado." };
  } catch (error) {
    console.error("Error details:", error);
    return {
      success: false,
      message: "Error al actualizar el encargado.",
    };
  }
};

// Delete Entrega
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

      if (folioResult.recordset[0].estado_documentos !== "En Curso") {
        return {
          success: false,
          message:
            "Solo se pueden eliminar las entregas con estado 'En Curso'.",
        };
      }

      // Obtener información del folio actual
      const current_folio_num = Number(folio.split("-")[0]);
      const folio_year = Number(folio.split("-")[1]);
      const folio_code = folio.split("-")[2];

      // Verificar si existen entregas posteriores en la misma campaña
      const posteriorEntregasRequest = new sql.Request(transaction);
      const posteriorEntregasResult = await posteriorEntregasRequest
        .input("current_folio_num", sql.Int, current_folio_num)
        .input("folio_year", sql.Int, folio_year)
        .input("folio_code", sql.NVarChar, folio_code).query(`
          SELECT COUNT(*) as count 
          FROM entregas 
          WHERE folio_num > @current_folio_num 
            AND folio_year = @folio_year 
            AND folio_code = @folio_code
        `);

      if (posteriorEntregasResult.recordset[0].count > 0) {
        return {
          success: false,
          message:
            "Ya no se puede eliminar esta entrega. Existen entregas posteriores en esta campaña.",
        };
      }

      // Get campaign IDs to update campaign counts
      const campaignRequest = new sql.Request(transaction);
      const campaignResult = await campaignRequest.input(
        "folio",
        sql.NVarChar,
        folio,
      ).query(`
        SELECT id_campaña FROM beneficios_entregados WHERE folio = @folio
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

export const toggleDiscardEntregaByFolio = async (
  folio: string,
  newState: string,
) => {
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

      const currentState = folioResult.recordset[0].estado_documentos;

      // Only allow state change if current state is not "Finalizado"
      if (currentState === "Finalizado") {
        return {
          success: false,
          message:
            "No se pueden modificar las entregas con estado 'Finalizado'.",
        };
      }

      // Get campaign IDs to update campaign counts
      const campaignRequest = new sql.Request(transaction);
      const campaignResult = await campaignRequest.input(
        "folio",
        sql.NVarChar,
        folio,
      ).query(`
        SELECT id_campaña FROM beneficios_entregados WHERE folio = @folio
      `);

      // Determine campaign counter based on state transition
      let entregaCounter = 0;
      if (currentState === "En Curso" && newState === "Anulado") {
        entregaCounter = -1; // Decrease count when canceling
      } else if (currentState === "Anulado" && newState === "En Curso") {
        entregaCounter = 1; // Increase count when reactivating
      }

      // Update campaign counts
      if (entregaCounter !== 0) {
        for (const campaign of campaignResult.recordset) {
          const updateCampaignRequest = new sql.Request(transaction);
          await updateCampaignRequest
            .input("campaignId", sql.UniqueIdentifier, campaign.id_campaña)
            .input("entregaCounter", sql.Int, entregaCounter).query(`
          UPDATE campañas
          SET entregas = entregas + @entregaCounter
          WHERE id = @campaignId
        `);
        }
      }

      // Update entrega state
      const updateEntregaRequest = new sql.Request(transaction);
      await updateEntregaRequest
        .input("folio", sql.NVarChar, folio)
        .input("newState", sql.NVarChar, newState).query(`
        UPDATE entregas SET estado_documentos = @newState WHERE folio = @folio
      `);

      await transaction.commit();
      const actionMessage =
        newState === "Anulado"
          ? "anuló la entrega"
          : "cambió el estado de la entrega";
      await logAction("Editar", actionMessage, "", folio);
      return {
        success: true,
        message: `Estado cambiado a '${newState}' correctamente`,
      };
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error al cambiar estado de entrega:", error);
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
    console.log("fileCount:", fileCount);

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

    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Check current document count before uploading
      const countRequest = new sql.Request(transaction);
      countRequest.input("folio", sql.NVarChar, folio);
      const countResult = await countRequest.query(`
        SELECT COUNT(*) AS count
        FROM documentos
        WHERE folio = @folio;
      `);

      const currentCount = (countResult.recordset[0]?.count as number) || 0;
      console.log("currentCount:", currentCount);

      const fileNamesRequest = new sql.Request(transaction);
      fileNamesRequest.input("folio", sql.NVarChar, folio);
      const fileNamesResult = await fileNamesRequest.query(`
        SELECT DISTINCT nombre_documento
        FROM documentos
        WHERE folio = @folio;
      `);

      const fileNames = fileNamesResult.recordset.map(
        (doc) => doc.nombre_documento,
      );

      // After getting currentCount
      if (currentCount >= 5) {
        await transaction.rollback();
        return {
          success: false,
          message: "Ya has alcanzado el máximo de 5 documentos permitidos.",
        };
      }

      // Prevent upload if total would exceed 4 documents
      if (currentCount + fileCount > 5) {
        await transaction.rollback();
        return {
          success: false,
          message: `No se pueden subir ${fileCount} documento(s). Hay ${currentCount} documento(s) y el máximo permitido es 5.`,
        };
      }

      const uploadPromises = [];
      let uploadedFilesNames = "";

      // First, validate all files before starting any database operations
      const filesToUpload: File[] = [];
      for (let i = 0; i < fileCount; i++) {
        const file = formData.get(`file${i}`) as File;
        if (!file) continue;

        const fileName = file.name;

        // Check if file name already exists
        const fileNameExists = fileNames.some((name) => name === fileName);
        if (fileNameExists) {
          await transaction.rollback();
          return {
            success: false,
            message: `No se puede volver a subir el documento ${fileName}`,
          };
        }

        // Check for duplicates within the current upload batch
        const duplicateInBatch = filesToUpload.some(
          (file) => file.name === fileName,
        );
        if (duplicateInBatch) {
          await transaction.rollback();
          return {
            success: false,
            message: `No se pueden subir archivos con nombres duplicados: ${fileName}`,
          };
        }

        filesToUpload.push(file);
        if (uploadedFilesNames === "") uploadedFilesNames += fileName;
        else uploadedFilesNames = `${uploadedFilesNames}, ${fileName}`;
      }
      console.log(uploadedFilesNames);

      // Process all validated files
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        const fileName = file.name;

        const fileArrayBuffer = await file.arrayBuffer();
        let fileBuffer = Buffer.from(fileArrayBuffer);

        // Check if filename contains 'cartola' and extract first page only
        if (fileName.toLowerCase().includes("cartola")) {
          try {
            const pdfDoc = await PDFDocument.load(fileArrayBuffer);

            // Create a new PDF with only the first page
            const newPdfDoc = await PDFDocument.create();
            const [firstPage] = await newPdfDoc.copyPages(pdfDoc, [0]);
            newPdfDoc.addPage(firstPage);

            // Convert back to buffer
            const pdfBytes = await newPdfDoc.save();
            fileBuffer = Buffer.from(pdfBytes);

            console.log(`Extracted first page from: ${fileName}`);
          } catch (error) {
            console.error(
              `Error extracting first page from ${fileName}:`,
              error,
            );
            // If extraction fails, use the original file
          }
        }

        const compressedBuffer = await compressPdfBuffer(fileBuffer);
        const fileBase64 = compressedBuffer.toString("base64");

        const fileType = ".pdf";
        const fecha = new Date();
        fecha.setMilliseconds(fecha.getMilliseconds() + i);

        const insertRequest = new sql.Request(transaction);
        const insertPromise = insertRequest
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

      // Insert all documents
      await Promise.all(uploadPromises);

      // Check for required document types instead of count
      const checkDocumentsRequest = new sql.Request(transaction);
      const documentsResult = await checkDocumentsRequest.input(
        "folio",
        sql.VarChar,
        folio,
      ).query(`
          SELECT nombre_documento 
          FROM documentos 
          WHERE folio = @folio
        `);

      const existingDocuments = documentsResult.recordset.map((doc) =>
        doc.nombre_documento.toLowerCase(),
      );

      // Check if all required document types are present
      const requiredDocTypes = ["entregas", "cedula", "acta", "cartola"];
      const hasAllRequiredDocs = requiredDocTypes.every((docType) =>
        existingDocuments.some((docName) => docName.includes(docType)),
      );

      const newEstado = hasAllRequiredDocs ? "Finalizado" : "En Curso";

      console.log(
        `Required docs check: ${hasAllRequiredDocs ? "Complete" : "Incomplete"}`,
      );
      console.log(`Existing documents: ${existingDocuments.join(", ")}`);

      const updateRequest = new sql.Request(transaction);
      await updateRequest
        .input("folio", sql.VarChar, folio)
        .input("estado", sql.VarChar, newEstado).query(`
          UPDATE entregas
          SET estado_documentos = @estado
          WHERE folio = @folio
        `);

      await transaction.commit();

      // Audit log description that fits within 50 characters
      let logDescription;
      if (fileCount === 1) {
        // For single file, use the filename (truncated if needed)
        logDescription =
          uploadedFilesNames.length > 35
            ? uploadedFilesNames.substring(0, 35) + "..."
            : uploadedFilesNames;
      } else {
        const countText = `${fileCount} archivos: `;
        const remainingSpace = 35 - countText.length;

        logDescription = `${countText}${uploadedFilesNames.substring(0, remainingSpace - 3)}...`;
      }

      // Ensure final length doesn't exceed 50
      const finalDescription =
        logDescription.length > 35
          ? logDescription.substring(0, 35) + "..."
          : logDescription;

      await logAction("Subir", `subió`, finalDescription, folio);

      return {
        success: true,
        message: `${fileCount} documento(s) guardado(s) correctamente`,
      };
    } catch (error) {
      // Rollback transaction on any error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

// Eliminar documento mediante id
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

    let logDescription = "PDF";

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
    SELECT id, nombre_documento FROM documentos
    WHERE id = @id
  `);

    logDescription = documentResult.recordset[0].nombre_documento;

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

      // Check for required document types after deletion
      const checkDocumentsRequest = new sql.Request(transaction);
      const documentsResult = await checkDocumentsRequest.input(
        "folio",
        sql.VarChar,
        folio,
      ).query(`
          SELECT nombre_documento 
          FROM documentos 
          WHERE folio = @folio
        `);

      const existingDocuments = documentsResult.recordset.map((doc) =>
        doc.nombre_documento.toLowerCase(),
      );

      // Check if all required document types are present
      const requiredDocTypes = ["entregas", "cedula", "acta", "cartola"];
      const hasAllRequiredDocs = requiredDocTypes.every((docType) =>
        existingDocuments.some((docName) => docName.includes(docType)),
      );

      const newEstado = hasAllRequiredDocs ? "Finalizado" : "En Curso";

      console.log(
        `After deletion - Required docs check: ${hasAllRequiredDocs ? "Complete" : "Incomplete"}`,
      );
      console.log(`Remaining documents: ${existingDocuments.join(", ")}`);

      // Update entregas status based on document type validation
      const updateRequest = new sql.Request(transaction)
        .input("folio", sql.NVarChar, folio)
        .input("estado", sql.VarChar, newEstado);
      await updateRequest.query(`
      UPDATE entregas
      SET estado_documentos = @estado
      WHERE folio = @folio
    `);

      await transaction.commit();
    } catch (error) {
      if (transaction) await transaction.rollback();
      throw error;
    }

    // Ensure final length doesn't exceed 50 characters
    const finalDescription =
      logDescription.length > 28
        ? logDescription.substring(0, 28) + "..."
        : logDescription;

    await logAction("Eliminar", "eliminó", finalDescription, folio);
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

    // await logAction(
    //   "Descargar",
    //   "descargó 1 documento",
    //   "PDF",
    //   documentResult.recordset[0].folio,
    // );
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
    SELECT campañas.nombre_campaña as campaign_name, beneficios_entregados.codigo_entrega as detail
    FROM beneficios_entregados 
    JOIN campañas ON campañas.id = beneficios_entregados.id_campaña
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
        // } else if (campaign_name.includes("Pañales")) {
        //   ["RN", "G", "XXG", "P", "XG", "Adultos"].forEach((tipo) => {
        //     if (detail === tipo) form.getTextField(tipo).setText("X"); // Cambiar "X" por cantidad de pañales. Mover "Adultos" a otro campo que si se marcara con "X".
        //   });
      } else if (campaign_name.includes("Pañales")) {
        ["RN", "G", "XXG", "P", "XG", "Adultos"].forEach((tipo) => {
          if (detail === tipo) form.getTextField(tipo).setText("X");
        });
      } else if (campaign_name.includes("Tarjeta de Comida")) {
        form.getTextField("CodigoTarjeta").setText(detail);
      } else {
        // form.getTextField("OtrosNombre").setText(detail); // Nombre campaña
        form.getTextField("Otros").setText(detail);
      }
    });

    form.getTextField("Justificacion").setText(observacion);
    form
      .getTextField("NombreProfesional")
      .setText(" " + encargado.nombre_usuario);
    // form
    //   .getTextField("NombreProfesionalFirma")
    //   .setText(" " + encargado.nombre_usuario);
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

    const checkRequest = pool.request();
    const checkResult = await checkRequest.input("folio", sql.NVarChar, folio)
      .query(`
        SELECT estado_documentos FROM entregas WHERE folio = @folio
      `);

    if (checkResult.recordset.length === 0) {
      return {
        success: false,
        message: "Entrega no encontrada",
      };
    }

    const currentState = checkResult.recordset[0].estado_documentos;

    // Prevent changes if current state is "Anulado"
    if (currentState === "Anulado") {
      return {
        success: false,
        message: "Entrega anulada, no se puede cambiar el estado",
      };
    }

    const updateRequest = pool.request();
    const result = await updateRequest
      .input("folio", sql.NVarChar, folio)
      .input("estado", sql.NVarChar, newStatus).query(`
        UPDATE entregas
        SET estado_documentos = @estado
        WHERE folio = @folio
      `);

    if (result.rowsAffected[0] === 0) {
      return {
        success: false,
        message: "No se pudo actualizar la entrega",
      };
    }

    return {
      success: true,
      message: "Estado actualizado correctamente",
    };
  } catch (error) {
    console.error("Error al actualizar el estado de la entrega:", error);
    return {
      success: false,
      message: "Error al cambiar el estado de la entrega",
    };
  }
};
