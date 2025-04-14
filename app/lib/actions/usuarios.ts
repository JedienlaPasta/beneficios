"use server";

import { connectToDB } from "../utils/db-connection";
import sql from "mssql";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";
import { logAction } from "./auditoria";

// Add a function to hash passwords
async function hashPassword(password: string): Promise<string> {
  // 10 is a good default salt rounds value - higher is more secure but slower
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

export async function createUser(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const correo = formData.get("correo") as string;
  const cargo = formData.get("cargo") as string;
  const rol = formData.get("rol") as string;
  const password = formData.get("password") as string;

  if (!nombre || !correo || !cargo || !rol || !password) {
    return { success: false, message: "Todos los campos son requeridos" };
  }

  try {
    const pool = await connectToDB();

    // Check if email already exists
    const checkEmail = await pool
      .request()
      .input("correo", sql.VarChar, correo)
      .query("SELECT COUNT(*) as count FROM usuarios WHERE correo = @correo");

    if (checkEmail.recordset[0].count > 0) {
      return {
        success: false,
        message: "El correo electrónico ya está registrado",
      };
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(password);

    // Create new user
    await pool
      .request()
      .input("nombre_usuario", sql.VarChar, nombre)
      .input("correo", sql.VarChar, correo)
      .input("cargo", sql.VarChar, cargo)
      .input("rol", sql.VarChar, rol)
      .input("contraseña", sql.VarChar, hashedPassword)
      .input("estado", sql.VarChar, "Habilitado") // Add default estado
      .query(`
        INSERT INTO usuarios (
          nombre_usuario, 
          correo, 
          cargo, 
          rol, 
          contraseña,
          estado
        ) 
        VALUES (
          @nombre_usuario, 
          @correo, 
          @cargo, 
          @rol, 
          @contraseña,
          @estado
        )
      `);

    const result = await pool
      .request()
      .input("correo", sql.VarChar, correo)
      .query("SELECT id FROM usuarios WHERE correo = @correo");

    await logAction("Crear", `creó al usuario`, nombre, result.recordset[0].id);

    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Usuario creado exitosamente" };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "Error al crear el usuario" };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const correo = formData.get("correo") as string;
  const cargo = formData.get("cargo") as string;
  const rol = formData.get("rol") as string;
  const password = formData.get("password") as string;

  if (!nombre || !correo || !cargo || !rol) {
    return {
      success: false,
      message: "Nombre, correo, cargo y rol son requeridos",
    };
  }

  try {
    const pool = await connectToDB();

    // Check if email already exists for other users
    const checkEmail = await pool
      .request()
      .input("correo", sql.VarChar, correo)
      .input("id", sql.UniqueIdentifier, userId)
      .query(
        "SELECT COUNT(*) as count FROM usuarios WHERE correo = @correo AND id != @id",
      );

    if (checkEmail.recordset[0].count > 0) {
      return {
        success: false,
        message: "El correo electrónico ya está registrado por otro usuario",
      };
    }

    // Update user
    const request = pool
      .request()
      .input("id", sql.UniqueIdentifier, userId)
      .input("nombre_usuario", sql.VarChar, nombre)
      .input("correo", sql.VarChar, correo)
      .input("cargo", sql.VarChar, cargo)
      .input("rol", sql.VarChar, rol);

    let query = `
      UPDATE usuarios 
      SET 
        nombre_usuario = @nombre_usuario, 
        correo = @correo, 
        cargo = @cargo, 
        rol = @rol
    `;

    // Only update password if provided
    if (password) {
      // Hash the password before updating
      const hashedPassword = await hashPassword(password);
      request.input("contraseña", sql.VarChar, hashedPassword);
      query += ", contraseña = @contraseña";
    }

    query += " WHERE id = @id";

    await request.query(query);

    await logAction("Editar", `editó al usuario`, nombre, userId);

    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Usuario actualizado exitosamente" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: "Error al actualizar el usuario" };
  }
}

// Add a function to toggle user status
export async function toggleUserStatus(userId: string, newStatus: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();

    const userResult = await request
      .input("id", sql.UniqueIdentifier, userId)
      .query("SELECT nombre_usuario FROM usuarios WHERE id = @id");

    if (userResult.recordset.length === 0) {
      return { success: false, message: "Usuario no encontrado" };
    }

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, userId)
      .input("estado", sql.VarChar, newStatus)
      .query("UPDATE usuarios SET estado = @estado WHERE id = @id");

    const nombre_dato = newStatus === "Habilitado" ? "habilitó" : "deshabilitó";
    const nombre_usuario = userResult.recordset[0].nombre_usuario;

    await logAction(
      "Editar",
      `${nombre_dato} al usuario`,
      nombre_usuario,
      userId,
    );
    revalidatePath("/dashboard/usuarios");
    return {
      success: true,
      message: `Usuario ${newStatus === "Habilitado" ? "habilitado" : "deshabilitado"} exitosamente`,
    };
  } catch (error) {
    console.error("Error toggling user status:", error);
    return {
      success: false,
      message: "Error al cambiar el estado del usuario",
    };
  }
}

export async function deleteUser(userId: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();

    const userResult = await request
      .input("id", sql.UniqueIdentifier, userId)
      .query("SELECT nombre_usuario FROM usuarios WHERE id = @id");

    if (userResult.recordset.length === 0) {
      return { success: false, message: "Usuario no encontrado" };
    }

    await pool
      .request()
      .input("id", sql.UniqueIdentifier, userId)
      .query("DELETE FROM usuarios WHERE id = @id");

    await logAction(
      "Eliminar",
      `eliminó al usuario`,
      userResult.recordset[0].nombre_usuario,
      userId,
    );
    revalidatePath("/dashboard/usuarios");
    return { success: true, message: "Usuario eliminado exitosamente" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Error al eliminar el usuario" };
  }
}
