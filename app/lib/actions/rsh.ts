// import postgres from "postgres";

import { FormState } from "@/app/ui/dashboard/campañas/new-campaign-modal";

// const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Crear RSH

// Editar RSH

// Eliminar RSH

export async function importXLSXFile(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const file = formData.get("file");
    console.log("Archivo recibido:", file);
    // Process the file as needed
    return { success: true, message: "Si se pudo" };
  } catch (error) {
    console.error("Error al importar el archivo:", error);
    return {
      success: false,
      message: "Error al importar el archivo",
    };
  }
}
