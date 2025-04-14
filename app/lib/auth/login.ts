import sql from "mssql";
import { connectToDB } from "../utils/db-connection";
import bcrypt from "bcrypt";

interface UserData {
  id: string;
  nombre: string;
  contraseña: string;
  correo: string;
  cargo: string;
  rol: string;
}

export async function authenticateUser(correo: string, contraseña: string) {
  try {
    const pool = await connectToDB();
    const userRequest = pool.request();
    userRequest.input("correo", sql.VarChar, correo);
    const user = await userRequest.query(
      `SELECT TOP 1 * FROM usuarios WHERE correo = @correo`,
    );

    if (!user.recordset[0].correo) {
      return {
        success: false,
        message: "Credenciales incorrectas",
        status: 404,
      };
    }

    const isPasswordValid = await bcrypt.compare(
      contraseña,
      user.recordset[0].contraseña,
    );

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Credenciales incorrectas",
        status: 401,
      };
    }

    if (user.recordset[0].estado === "Deshabilitado") {
      return {
        success: false,
        message: "Cuenta Suspendida",
        status: 401,
      };
    }

    const userData: UserData = {
      id: user.recordset[0].id,
      nombre: user.recordset[0].nombre_usuario,
      contraseña: user.recordset[0].contraseña,
      correo: user.recordset[0].correo,
      cargo: user.recordset[0].cargo,
      rol: user.recordset[0].rol,
    };

    return {
      success: true,
      user: userData,
      status: 200,
      message: "Bienvenido!",
    };
  } catch (error) {
    console.error("Error en la autenticación:", error);
    return { success: false, error: "Error en el servidor", status: 500 };
  }
}
