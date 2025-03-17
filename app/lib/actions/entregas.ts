"use server";

import postgres from "postgres";
import { z } from "zod";

// Crear Entrega

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });

const CreateEntregaFormSchema = z.object({
  id_usuario: z.string(),
  rut: z.string(),
  observaciones: z.string(),
  campaigns: z.array(
    z.object({
      //campaign_id
      id: z.string(),
      campaignName: z.string(),
      detail: z.string(),
      code: z.string(),
    }),
  ),
});

const CreateEntrega = CreateEntregaFormSchema.omit({ id_usuario: true });

export const createEntrega = async (id: string, formData: FormData) => {
  try {
    const { rut, observaciones, campaigns } = CreateEntrega.parse({
      rut: formData.get("rut"),
      observaciones: formData.get("observaciones"),
      campaigns: JSON.parse(formData.get("campaigns") as string),
    });
    console.log("server");
    console.log(id);
    console.log(rut);
    console.log(observaciones);
    console.log(campaigns);

    let code;
    if (campaigns.length === 0)
      throw new Error("No se seleccionó ninguna campaña");
    if (campaigns.length > 1) code = "DO";
    else code = campaigns[0].code;

    console.log(code);

    await sql.begin(async (sql) => {
      const entrega = await sql`
        INSERT INTO entregas (folio, observacion, rut, id_usuario)
        VALUES (
            concat(
                substring(replace(uuid_generate_v4()::text, '-', '') from 1 for 8), 
                '-', 
                to_char(current_date, 'YY'), 
                '-', 
                ${code}::TEXT
            ),
            ${observaciones},
            ${rut},
            ${id}
        )
        RETURNING folio
      `;

      const folio = entrega[0].folio;

      const entregaQueries = campaigns.map((campaign) => {
        return sql`
              INSERT INTO entrega (detalle, folio, id_campaña)
              VALUES (${campaign.detail}, ${folio}, ${campaign.id})
          `;
      });
      await Promise.all(entregaQueries);
    });

    return { success: true, message: "Entrega recibida" };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};

// Editar Entrega

// Eliminar Entrega
