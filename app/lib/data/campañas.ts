import { Campaign } from "../definitions";
import { connectToDB } from "../utils/db-connection";
import sql from "mssql";

export async function fetchCampaignById(id: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request
      .input("id", sql.NVarChar, id)
      .query(`SELECT * FROM campañas WHERE id = @id`);

    // Return as an array to maintain consistency with other fetch functions
    return { data: result.recordset as Campaign[] };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [] }; // Return empty array instead of empty object
  }
}

export async function fetchCampaigns(
  query: string,
  currentPage: number,
  resultsPerPage: number,
) {
  const offset = (currentPage - 1) * resultsPerPage || 0;
  try {
    const pool = await connectToDB();
    const request = new sql.Request(pool);

    // Use a more efficient query structure
    const result = await request
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT c.*,
          CASE 
            WHEN c.fecha_inicio > GETUTCDATE() THEN 'Pendiente'
            WHEN c.fecha_inicio <= GETUTCDATE() AND c.fecha_termino >= GETUTCDATE() THEN 'En Curso'
            ELSE 'Finalizada'
          END AS estado,
          ISNULL(e.total_entregas, 0) AS total_entregas,
          t.total_count AS total
        FROM campañas c
        OUTER APPLY (
          SELECT COUNT(*) AS total_entregas 
          FROM entrega 
          WHERE entrega.id_campaña = c.id
        ) e
        CROSS JOIN (
          SELECT COUNT(*) AS total_count 
          FROM campañas 
          WHERE nombre_campaña LIKE @query
        ) t
        WHERE c.nombre_campaña LIKE @query
        ORDER BY c.fecha_inicio DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    // Handle the case where no records are found
    if (result.recordset.length === 0) {
      return { data: [], pages: 0 };
    }

    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );
    return { data: result.recordset, pages };
  } catch (error) {
    console.error("Error al obtener campañas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchActiveCampaigns() {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request.query(`
      SELECT * FROM campañas 
      WHERE fecha_inicio <= GETUTCDATE() AND fecha_termino >= GETUTCDATE()
      ORDER BY fecha_inicio DESC
      `);
    return { data: result.recordset as Campaign[] };
  } catch (error) {
    console.error("Error al obtener campañas activas:", error);
    return { data: [] };
  }
}
