"use server";

import sql from "mssql";
import { connectToDB } from "../utils/db-connection";
import { getSession } from "../session";

type AuditAction = "Crear" | "Editar" | "Eliminar" | "Importar" | string;

/**
 * Logs an action to the auditoria table
 * @param accion The type of action performed (Crear, Editar, Eliminar, etc.)
 * @param comentario_accion Description of what was affected
 * @param comentario_nombre Name of affecter record/module
 * @param id_registro_mod ID of the affected record/module
 * @param userId Optional user ID (if not provided, will try to get from session)
 * @returns Promise with success status and message
 */
export async function logAction(
  accion: AuditAction,
  comentario_accion: string,
  comentario_nombre: string,
  id_registro_mod?: string,
  userId?: string,
) {
  let sessionId = userId;
  try {
    // If userId is not provided, try to get it from the session
    if (!userId) {
      const session = await getSession();
      sessionId = String(session?.userId);

      // If still no userId, use a default value
      if (!sessionId) {
        sessionId = "sistema";
      }
    }

    const pool = await connectToDB();
    const request = pool.request();

    // Get user name from userId
    const userResult = await request.input("sessionId", sql.VarChar, sessionId)
      .query(`
        SELECT nombre_usuario 
        FROM usuarios 
        WHERE id = @sessionId
      `);

    const nombre_usuario =
      userResult.recordset.length > 0
        ? userResult.recordset[0].nombre_usuario
        : "Sistema";

    await request
      .input("accion", sql.VarChar, accion)
      .input("comentario_accion", sql.VarChar, comentario_accion)
      .input("comentario_nombre", sql.VarChar, comentario_nombre || null)
      .input("userId", sql.VarChar, sessionId) // Changed parameter name from sessionId to userId
      .input("nombre_usuario", sql.VarChar, nombre_usuario)
      .input("id_registro_mod", sql.VarChar, id_registro_mod).query(`
        INSERT INTO auditoria (accion, comentario_accion, comentario_nombre, fecha, id_usuario, nombre_usuario, id_registro_mod)
        VALUES (@accion, @comentario_accion, @comentario_nombre, GETUTCDATE(), @userId, @nombre_usuario, @id_registro_mod)
      `);

    return { success: true };
  } catch (error) {
    console.error("Error logging action:", error);
    return { success: false, message: "Error al registrar la acción" };
  }
}
