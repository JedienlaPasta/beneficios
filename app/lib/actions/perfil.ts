"use server";
import { z } from "zod";
import sql from "mssql";
import bcrypt from "bcrypt";
import { connectToDB } from "../utils/db-connection";
import { revalidatePath } from "next/cache";

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

const passwordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z
    .string()
    .min(8, { message: "Contraseña debe tener al menos 8 caracteres" })
    .max(20, { message: "Contraseña debe tener como máximo 20 caracteres" })
    .regex(/[A-Z]/, {
      message: "Contraseña debe tener al menos una letra mayúscula",
    })
    .regex(/[a-z]/, {
      message: "Contraseña debe tener al menos una letra minúscula",
    })
    .regex(/[0-9]/, {
      message: "Contraseña debe tener al menos un número",
    })
    .regex(/[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/, {
      message: "Contraseña debe tener al menos un carácter especial",
    }),
  confirmPassword: z.string(),
});

export async function changePassword(userId: string, formData: FormData) {
  // First check if all required fields are present
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "Todos los campos son requeridos" };
  }

  // Then check if passwords match before validating complex rules
  if (newPassword !== confirmPassword) {
    return { success: false, message: "Las contraseñas no coinciden" };
  }

  // Then validate password complexity using Zod
  const result = passwordSchema.safeParse({
    currentPassword,
    newPassword,
    confirmPassword,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0].message,
    };
  }

  try {
    const pool = await connectToDB();
    const request = pool.request();

    // Check if user exists
    const userResult = await request
      .input("id", sql.UniqueIdentifier, userId)
      .query("SELECT contraseña FROM usuarios WHERE id = @id");

    if (userResult.recordset.length === 0) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Verify current password
    const comparePassword = await bcrypt.compare(
      currentPassword,
      userResult.recordset[0].contraseña,
    );

    if (!comparePassword) {
      return { success: false, message: "Contraseña actual incorrecta" };
    }

    const hashedPassword = await hashPassword(newPassword);

    await request
      .input("userId", sql.UniqueIdentifier, userId)
      .input("newPassword", sql.VarChar(120), hashedPassword)
      .query(
        "UPDATE usuarios SET contraseña = @newPassword WHERE id = @userId",
      );

    revalidatePath("/dashboard/pefil");
    return { success: true, message: "Contraseña cambiada con éxito" };
  } catch (error) {
    console.error("Error al cambiar la contraseña:", error);
    return { success: false, message: "Error al cambiar la contraseña" };
  }
}
