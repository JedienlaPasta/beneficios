import { NextResponse } from "next/server";
import postgres from "postgres";
// import { z } from "zod";
// import bcrypt from "bcrypt";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

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
    // const user = await sql`SELECT * FROM usuarios WHERE correo = ${correo}` as UserData;
    const userRows = await sql`SELECT * FROM usuarios WHERE correo = ${correo}`;

    if (userRows.length === 0) {
      return { success: false, error: "Credenciales incorrectas", status: 404 };
    }

    const user = userRows[0];

    if (!user) {
      return { success: false, error: "Credenciales incorrectas", status: 404 };
    }

    // In a real implementation, use bcrypt to compare passwords
    // const isPasswordValid = await bcrypt.compare(contraseña, user.contraseña);
    const isPasswordValid = contraseña === user.contraseña;

    if (!isPasswordValid) {
      return { success: false, error: "Credenciales incorrectas", status: 401 };
    }

    const userResponse: UserResponse = {
      id_usuario: user.id,
      nombre: user.nombre,
      rol: user.rol,
      cargo: user.cargo,
      correo: user.correo,
    };
    return {
      success: true,
      user: userResponse,
      status: 200,
      sessionData: {
        nombre: user.nombre,
        rol: user.rol,
        cargo: user.cargo,
        correo: user.correo,
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
