"use server";

import { connectToDB } from "../utils/db-connection";
import sql from "mssql";

export async function getUserData(userId: string) {
  try {
    const pool = await connectToDB();
    const userRequest = pool.request();
    userRequest.input("id", sql.UniqueIdentifier, userId);

    const result = await userRequest.query(
      `SELECT id, nombre_usuario, correo, cargo, rol FROM usuarios WHERE id = @id`,
    );

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}
