"use server";

import { z } from "zod";
import { authenticateUser } from "../auth/login";
import { createSession, deleteSession } from "../session";
import { redirect } from "next/navigation";
import { logAction } from "./auditoria";

const loginSchema = z.object({
  correo: z.string().email({ message: "Credenciales inválidas" }).trim(),
  contraseña: z.string({ message: "Credenciales inválidas" }).trim(),
});

export async function loginAction(formData: FormData) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  const { correo, contraseña } = result.data;
  const authResult = await authenticateUser(correo, contraseña);

  if (!authResult.success) {
    return {
      success: false,
      error: authResult.message || "Error en la autenticación",
    };
  }

  if (!authResult.user) {
    return {
      success: false,
      error: "Usuario no encontrado",
    };
  }

  await createSession(
    authResult.user.id,
    authResult.user.nombre,
    authResult.user.rol,
  );
  await logAction("Iniciar", "inició sesión", "");
  return { success: true, message: "Bienvenido!" };
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
