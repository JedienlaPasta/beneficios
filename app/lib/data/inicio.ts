import { connectToDB } from "../utils/db-connection";

export async function fetchGeneralInfo() {
  try {
    const pool = await connectToDB();
    const request = pool.request();

    const activeCampaignsResult = await request.query(`
      SELECT COUNT(*) as active_campaigns
      FROM campañas
      WHERE fecha_inicio <= GETDATE() AND fecha_termino >= GETDATE()
    `);

    const totalEntregasResult = await request.query(`
      SELECT COUNT(*) as total_entregas
      FROM entrega
    `);

    const totalBeneficiariosResult = await request.query(`
      SELECT COUNT(*) as total_beneficiarios
      FROM rsh
    `);

    const data = [
      {
        active_campaigns: activeCampaignsResult.recordset[0].active_campaigns,
        total_entregas: totalEntregasResult.recordset[0].total_entregas,
        total_beneficiarios:
          totalBeneficiariosResult.recordset[0].total_beneficiarios,
      },
    ];

    return data;
  } catch (error) {
    console.error("Error al obtener informacion general:", error);
    return [
      {
        active_campaigns: 0,
        total_entregas: 0,
        total_beneficiarios: 0,
      },
    ];
  }
}
