"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { FormState } from "../ui/dashboard/campañas/new-campaign-modal";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

// Crear Campaña ========================================================================
const CreateCampaignFormSchema = z.object({
  id: z.string(),
  nombre: z.string().min(3, { message: "Nombre es requerido" }),
  fechaInicio: z.string(),
  fechaTermino: z.string(),
  estado: z.enum(["En curso", "Finalizado"]),
  descripcion: z.string(),
  entregas: z.number(),
  tipoDato: z.string(),
  tramo: z.string().transform((str) => str === "true"),
  discapacidad: z.string().transform((str) => str === "true"),
  adultoMayor: z.string().transform((str) => str === "true"),
});

const CreateCampaign = CreateCampaignFormSchema.omit({
  id: true,
  fechaInicio: true,
  estado: true,
  entregas: true,
})
  .partial()
  .required({
    nombre: true,
    fechaTermino: true,
    descripcion: true,
    tipoDato: true,
    tramo: true,
    discapacidad: true,
    adultoMayor: true,
  });
// Add return type to the server action
export async function createCampaign(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    console.log(formData);
    const {
      nombre,
      fechaTermino,
      descripcion,
      tipoDato,
      tramo,
      discapacidad,
      adultoMayor,
    } = CreateCampaign?.parse({
      nombre: formData.get("nombre"),
      fechaTermino: formData.get("fechaTermino"),
      descripcion: formData.get("descripcion"),
      tipoDato: formData.get("tipoDato"),
      tramo: formData.get("tramo"),
      discapacidad: formData.get("discapacidad"),
      adultoMayor: formData.get("adultoMayor"),
    });
    const fechaInicio = new Date();

    if (!fechaInicio || !fechaTermino)
      throw new Error("Las fechas son requeridas");
    if (new Date(fechaTermino) < fechaInicio) {
      throw new Error(
        "La fecha de término no puede ser menor a la fecha de inicio",
      );
    }
    const estado =
      new Date(fechaTermino) > fechaInicio ? "En curso" : "Finalizado";
    const entregas = 0;

    await sql`
      INSERT INTO campañas (nombre, fecha_inicio, fecha_termino, descripcion, tipo_dato, estado, entregas, tramo, discapacidad, adulto_mayor)
      VALUES (${nombre}, ${fechaInicio}, ${fechaTermino}, ${descripcion.toUpperCase()}, ${tipoDato}, ${estado}, ${entregas}, ${tramo}, ${discapacidad}, ${adultoMayor})
    `;

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

// Editar Campaña =================================================================================
const UpdateCampaignFormSchema = z.object({
  id: z.string(),
  nombre: z.string().min(3, { message: "Nombre es requerido" }),
  fechaInicio: z.string(),
  fechaTermino: z.string(),
  estado: z.enum(["En curso", "Finalizado"]),
  tipoDato: z.string(),
  tramo: z.string().transform((str) => str === "true"),
  discapacidad: z.string().transform((str) => str === "true"),
  adultoMayor: z.string().transform((str) => str === "true"),
});

const UpdateCampaign = UpdateCampaignFormSchema.omit({
  id: true,
  estado: true,
})
  .partial()
  .required({
    nombre: true,
    fechaInicio: true,
    fechaTermino: true,
    tipoDato: true,
    tramo: true,
    discapacidad: true,
    adultoMayor: true,
  });

export async function updateCampaign(id: string, formData: FormData) {
  try {
    const {
      nombre,
      fechaInicio,
      fechaTermino,
      tipoDato,
      tramo,
      discapacidad,
      adultoMayor,
    } = UpdateCampaign.parse({
      nombre: formData.get("nombre"),
      fechaInicio: formData.get("fechaInicio"),
      fechaTermino: formData.get("fechaTermino"),
      tipoDato: formData.get("tipoDato"),
      tramo: formData.get("tramo"),
      discapacidad: formData.get("discapacidad"),
      adultoMayor: formData.get("adultoMayor"),
    });

    if (!fechaInicio || !fechaTermino)
      throw new Error("Las fechas son requeridas");
    if (new Date(fechaTermino) < new Date(fechaInicio))
      throw new Error(
        "La fecha de término no puede ser menor a la fecha de inicio",
      );

    await sql`
      UPDATE campañas
      SET nombre = ${nombre},
          fecha_inicio = ${fechaInicio},
          fecha_termino = ${fechaTermino},
          tipo_dato = ${tipoDato},
          tramo = ${tramo},
          discapacidad = ${discapacidad},
          adulto_mayor = ${adultoMayor}
      WHERE id = ${id}
      `;

    revalidatePath("/dashboard/campanas");
    return { success: true, message: "Campaña actualizada exitosamente" };
  } catch (error) {
    console.error("Error al crear la campaña:", error);
    return {
      success: false,
      message: "Error al crear la campaña",
    };
  }
}

// Eliminar Campaña ===============================================================================
export async function deleteCampaign(id: string) {
  try {
    await sql`
      DELETE FROM campañas
      WHERE id = ${id}
    `;

    revalidatePath("/dashboard/campanas");
    return { success: true, message: "Campaña eliminada exitosamente" };
  } catch (error) {
    console.error("Error al eliminar la campaña:", error);
    return {
      success: false,
      message: "Error al eliminar la campaña",
    };
  }
}
