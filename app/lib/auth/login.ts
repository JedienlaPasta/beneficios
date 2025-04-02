import { NextResponse } from "next/server";
import sql from "mssql";
import { connectToDB } from "../utils/db-connection";
// import { z } from "zod";
// import bcrypt from "bcrypt";

// interface UserData {
//   nombre: string;
//   cargo: string;
//   rol: string;
//   correo: string;
//   id: string;
//   contraseña: string;
// }

interface UserResponse {
  nombre: string;
  cargo: string;
  rol: string;
  correo: string;
  id_usuario: string;
}

// const UserLoginFormSchema = z.object({
//   correo: z.string().min(6, { message: "Correo es requerido" }),
//   contraseña: z.string().min(6, { message: "Contraseña es requerida" }),
// });

// const UserLogin = UserLoginFormSchema
//   .required({
//     correo: true,
//     contraseña: true,
//   });

export async function authenticateUser(correo: string, contraseña: string) {
  try {
    const pool = await connectToDB();
    const userRequest = pool.request();
    userRequest.input("correo", sql.VarChar, correo);
    const user = await userRequest.query(
      `SELECT TOP 1 * FROM usuarios WHERE correo = @correo`,
    );
    console.log(user);

    if (user.recordset.length === 0) {
      return { success: false, error: "Credenciales incorrectas", status: 404 };
    }

    if (!user.recordset[0].correo) {
      return { success: false, error: "Credenciales incorrectas", status: 404 };
    }

    // In a real implementation, use bcrypt to compare passwords
    // const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    const isPasswordValid = contraseña === user.recordset[0].contraseña;

    if (!isPasswordValid) {
      return { success: false, error: "Credenciales incorrectas", status: 401 };
    }

    const userResponse: UserResponse = {
      id_usuario: user.recordset[0].id,
      nombre: user.recordset[0].nombre_usuario,
      rol: user.recordset[0].rol,
      cargo: user.recordset[0].cargo,
      correo: user.recordset[0].correo,
    };
    return {
      success: true,
      user: userResponse,
      status: 200,
      sessionData: {
        nombre: user.recordset[0].nombre_usuario,
        rol: user.recordset[0].rol,
        cargo: user.recordset[0].cargo,
        correo: user.recordset[0].correo,
      },
      message: "Bienvenido!",
    };
  } catch (error) {
    console.error("Error en la autenticación:", error);
    return { success: false, error: "Error en el servidor", status: 500 };
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const authResult = await authenticateUser(email, password);

    const response = NextResponse.json(
      {
        success: authResult.success,
        user: authResult.user,
        error: authResult.error,
        message: authResult.message, // Add this line
      },
      { status: authResult.status },
    );

    if (authResult.success) {
      response.cookies.set({
        name: "userSession",
        value: JSON.stringify(authResult.sessionData),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 day
      });
    }

    return response;
  } catch (error) {
    console.error("Error en el login:", error);
    return NextResponse.json(
      { success: false, error: "Error en el servidor" },
      { status: 500 },
    );
  }
}
