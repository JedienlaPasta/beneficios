import { NextResponse } from "next/server";
import type { ActaData } from "@/app/lib/pdf/types";
import { getActaDataByFolio } from "@/app/lib/data/entregas"; // Ajusta si tu función está en otro archivo
import { datosPrueba } from "@/app/lib/pdf/datos-prueba";

export async function GET(
  _req: Request,
  context: { params: Promise<{ folio: string }> },
) {
  try {
    const { folio } = await context.params;
    const data = (await getActaDataByFolio(folio)) || (datosPrueba as ActaData);

    if (!data) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
