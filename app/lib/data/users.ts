import { UserData } from "../definitions";
import { connectToDB } from "../utils/db-connection";
import sql from "mssql";

export async function getUsers(): Promise<UserData[]> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return [];
    }

    const result = await pool.request().query(`
      SELECT 
        id, 
        nombre_usuario, 
        correo, 
        cargo, 
        rol,
        estado
      FROM usuarios
      ORDER BY nombre_usuario
    `);

    return result.recordset;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch users data");
  }
}

export async function getUserById(id: string): Promise<UserData> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        id: "",
        nombre_usuario: "",
        correo: "",
        cargo: "",
        rol: "",
        estado: "",
      };
    }

    const result = await pool.request().input("id", sql.UniqueIdentifier, id)
      .query(`
        SELECT 
          id, 
          nombre_usuario, 
          correo, 
          cargo, 
          rol,
          estado
        FROM usuarios 
        WHERE id = @id
      `);

    return result.recordset[0] || null;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch user data");
  }
}
