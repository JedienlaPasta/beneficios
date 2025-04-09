import { connectToDB } from "../utils/db-connection";
import sql from "mssql";

export type User = {
  id: string;
  nombre_usuario: string;
  correo: string;
  cargo: string;
  rol: string;
  estado: string;
};

export async function getUsers(): Promise<User[]> {
  try {
    const pool = await connectToDB();
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

export async function getUserById(id: string): Promise<User | null> {
  try {
    const pool = await connectToDB();
    const result = await pool
      .request()
      .input("id", sql.UniqueIdentifier, id)
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
