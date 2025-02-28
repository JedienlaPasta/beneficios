"use server";

import { z } from "zod";
import postgres from "postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

const CrearCampaña = FormSchema.omit({
  id: true,
  fechaInicio: true,
  estado: true,
  entregas: true,
});

export async function crearCampaña(formData: FormData) {
  const { nombre, fechaTermino, descripcion } = CrearCampaña?.parse({
    nombre: formData?.get("nombre"),
    fechaTermino: formData?.get("termino"),
    descripcion: formData?.get("descripcion"),
  });
  const fechaInicio = new Date();
  const termino = new Date(fechaTermino);
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

  revalidatePath("/dashboard/campanas");
  redirect("/dashboard/campanas");
}
