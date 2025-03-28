import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchGeneralInfo() {
  try {
    const data = sql.begin(async (sql) => {
      const activeCampaigns = await sql`
        SELECT COUNT (*) as active_campaigns
        FROM campañas
        WHERE fecha_inicio <= CURRENT_DATE AND fecha_termino >= NOW()
        `;
      const totalEntregas = await sql`
        SELECT COUNT (*) as total_entregas
        FROM entrega
        `;
      const totalBeneficiarios = await sql`
        SELECT COUNT (*) as total_beneficiarios
        FROM rsh
        `;
      return [
        {
          active_campaigns: activeCampaigns[0].active_campaigns,
          total_entregas: totalEntregas[0].total_entregas,
          total_beneficiarios: totalBeneficiarios[0].total_beneficiarios,
        },
      ];
    });

    return data;
  } catch (error) {
    console.error("Error al obtener datos de la tabla de general_info:", error);
    return [
      {
        active_campaigns: 0,
        total_entregas: 0,
        total_beneficiarios: 0,
      },
    ];
  }
}
