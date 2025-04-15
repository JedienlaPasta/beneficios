import dayjs from "dayjs";
import { connectToDB } from "../utils/db-connection";
import utc from "dayjs/plugin/utc";

export async function fetchGeneralInfo() {
  try {
    const pool = await connectToDB();
    const request = pool.request();

    const activeCampaignsResult = await request.query(`
      SELECT COUNT(*) as active_campaigns
      FROM campañas
      WHERE fecha_inicio <= GETUTCDATE() AND fecha_termino >= GETUTCDATE()
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

export async function fetchDailyEntregasCountByYear(year: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();

    const result = await request.query(`
      SELECT
        CAST(fecha_entrega AS DATE) as fecha,
        COUNT(*) as cantidad_entregas
      FROM entregas
      WHERE fecha_entrega BETWEEN '2025-01-01' AND '2025-12-31'
      GROUP BY CAST(fecha_entrega AS DATE)
      ORDER BY fecha;
    `);

    const entregasPorDia = result.recordset.reduce(
      (acc, entrega) => {
        dayjs.extend(utc);
        const dateStr = dayjs.utc(entrega.fecha).format("YYYY-MM-DD");
        acc[dateStr] = entrega.cantidad_entregas;
        return acc;
      },
      {} as Record<string, number>,
    );

    return entregasPorDia;
  } catch (error) {
    console.error("Error al obtener el conteo diario de entregas:", error);
    return [];
  }
}
