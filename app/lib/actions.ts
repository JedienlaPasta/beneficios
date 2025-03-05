"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { FormState } from "../ui/dashboard/campañas/new-campaign-modal";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

const FormSchema = z.object({
  id: z.string(),
  nombre: z.string().min(3, { message: "Nombre es requerido" }),
  fechaInicio: z.string(),
  fechaTermino: z.string(),
  estado: z.enum(["En curso", "Finalizado"]),
  entregas: z.number(),
  descripcion: z.string(),
});

const CreateCampaign = FormSchema.omit({
  id: true,
  fechaInicio: true,
  estado: true,
  entregas: true,
});
// Add return type to the server action
export async function createCampaign(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const { nombre, fechaTermino, descripcion } = CreateCampaign?.parse({
      nombre: formData?.get("nombre"),
      fechaTermino: formData?.get("termino"),
      descripcion: formData?.get("descripcion"),
    });
    const fechaInicio = new Date();
    const termino = new Date(fechaTermino + "T00:00:00-04:00");
    console.log("Termino: ", fechaTermino);
    console.log("Termino: ", termino.toString());
    if (termino < fechaInicio) {
      throw new Error(
        "La fecha de término no puede ser menor a la fecha de inicio",
      );
    }
    const estado = termino > fechaInicio ? "En curso" : "Finalizado";
    const entregas = 0;

    await sql`
      INSERT INTO campañas (nombre, fecha_inicio, fecha_termino, estado, entregas, descripcion)
      VALUES (${nombre}, ${fechaInicio}, ${termino}, ${estado}, ${entregas}, ${descripcion})
    `;

    await new Promise((resolve) => setTimeout(resolve, 1500));
    revalidatePath("/dashboard/campanas");

    return { success: true, message: "Campaña creada exitosamente" };
  } catch (error) {
    console.error("Error al crear la campaña:", error);
    return {
      success: false,
      message: "Error al crear la campaña",
    };
  }
}
