"use server";

import { UserData } from "../definitions";
import { connectToDB } from "../utils/db-connection";
import sql from "mssql";

export async function getUserData(userId: string): Promise<UserData> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        nombre_usuario: "",
        correo: "",
        cargo: "",
        rol: "",
        id: "",
        estado: "",
      };
    }

    const userRequest = pool.request();
    userRequest.input("id", sql.UniqueIdentifier, userId);

    const result = await userRequest.query(
      `SELECT id, nombre_usuario, correo, cargo, rol FROM usuarios WHERE id = @id`,
    );

    if (result.recordset.length === 0) {
      return {
        nombre_usuario: "",
        correo: "",
        cargo: "",
        rol: "",
        id: "",
        estado: "",
      };
    }

    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching user data:", error);
    return {
      nombre_usuario: "",
      correo: "",
      cargo: "",
      rol: "",
      id: "",
      estado: "",
    };
  }
}
