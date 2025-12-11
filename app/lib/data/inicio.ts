import sql from "mssql";
import dayjs from "dayjs";
import { connectToDB } from "../utils/db-connection";
import utc from "dayjs/plugin/utc";
import { GeneralInfo } from "../definitions";

export async function fetchGeneralInfo(): Promise<GeneralInfo> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {
        active_campaigns: 0,
        total_entregas: 0,
        total_beneficiarios: 0,
      };
    }
    const request = pool.request();

    const activeCampaignsResult = await request.query(`
      SELECT COUNT(*) as active_campaigns
      FROM campañas
      WHERE fecha_inicio <= GETUTCDATE() AND fecha_termino >= GETUTCDATE()
    `);

    const totalEntregasResult = await request.query(`
      SELECT COUNT(*) as total_entregas
      FROM beneficios_entregados
    `);

    const totalBeneficiariosResult = await request.query(`
      SELECT COUNT(*) as total_beneficiarios
      FROM rsh
    `);

    return {
      active_campaigns: activeCampaignsResult.recordset[0].active_campaigns,
      total_entregas: totalEntregasResult.recordset[0].total_entregas,
      total_beneficiarios:
        totalBeneficiariosResult.recordset[0].total_beneficiarios,
    };
  } catch (error) {
    console.error("Error al obtener informacion general:", error);
    return {
      active_campaigns: 0,
      total_entregas: 0,
      total_beneficiarios: 0,
    };
  }
}

export async function fetchDailyEntregasCountByYear(year: string) {
  try {
    // Extend dayjs with UTC plugin once
    dayjs.extend(utc);

    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return {} as Record<string, number>;
    }
    const request = pool.request();

    // Use parameterized query to prevent SQL injection
    const result = await request
      .input("startDate", sql.Date, `${year}-01-01`)
      .input("endDate", sql.Date, `${year}-12-31`).query(`
        SELECT
          CAST(fecha_entrega AS DATE) as fecha,
          COUNT(*) as cantidad_entregas
        FROM entregas
        WHERE fecha_entrega BETWEEN @startDate AND @endDate
        GROUP BY CAST(fecha_entrega AS DATE)
        ORDER BY fecha;
      `);

    const entregasPorDia = result.recordset.reduce(
      (acc, entrega) => {
        const dateStr = dayjs.utc(entrega.fecha).format("YYYY-MM-DD");
        acc[dateStr] = entrega.cantidad_entregas;
        return acc;
      },
      {} as Record<string, number>,
    );

    return entregasPorDia;
  } catch (error) {
    console.error("Error al obtener el conteo diario de entregas:", error);
    // Return empty object instead of empty array to match return type
    return {} as Record<string, number>;
  }
}
