"use server";

import sql from "mssql";
import { connectToDB } from "../utils/db-connection";
import { getSession } from "../session";

type AuditAction = "Crear" | "Editar" | "Eliminar" | "Ver" | string;

/**
 * Logs an action to the auditoria table
 * @param accion The type of action performed (Crear, Editar, Eliminar, etc.)
 * @param dato Description of what was affected
 * @param id_mod ID of the affected record/module
 * @param userId Optional user ID (if not provided, will try to get from session)
 * @returns Promise with success status and message
 */
export async function logAction(
  accion: AuditAction,
  dato: string,
  id_mod: string,
  userId?: string,
) {
  let id = userId;
  try {
    // If userId is not provided, try to get it from the session
    if (!userId) {
      const session = await getSession();
      id = String(session?.userId);

      // If still no userId, use a default value
      if (!id) {
        id = "sistema";
      }
    }

    const pool = await connectToDB();
    const request = pool.request();

    // Get user name from userId
    const userResult = await request.input("id", sql.UniqueIdentifier, id)
      .query(`
        SELECT nombre_usuario 
        FROM usuarios 
        WHERE id = @id
      `);

    const nombre_usuario =
      userResult.recordset.length > 0
        ? userResult.recordset[0].nombre_usuario
        : "Sistema";

    // Insert audit record
    // Esta bien la estructura? siempre se ingresaria el id_mod?, hay distintos casos? deberia ingresar nombres?
    await request
      .input("nombre_usuario", sql.NVarChar, nombre_usuario)
      .input("accion", sql.NVarChar, accion)
      .input("dato", sql.NVarChar, dato)
      .input("id_mod", sql.NVarChar, id_mod).query(`
        INSERT INTO auditoria (nombre_usuario, accion, dato, fecha, id_mod)
        VALUES (@nombre_usuario, @accion, @dato, GETUTCDATE(), @id_mod)
      `);

    return { success: true };
  } catch (error) {
    console.error("Error logging action:", error);
    return { success: false, message: "Error al registrar la acción" };
  }
}
