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
    const request = pool.request();
    const result = await request
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT campañas.*,
          CASE 
            WHEN campañas.fecha_inicio > GETDATE() THEN 'Pendiente'
            WHEN campañas.fecha_inicio <= GETDATE() AND campañas.fecha_termino >= GETDATE() THEN 'En Curso'
            ELSE 'Finalizada'
          END AS estado,
          (SELECT COUNT(*) FROM entrega WHERE entrega.id_campaña = campañas.id) AS total_entregas,
          COUNT(*) OVER() AS total
        FROM campañas 
        WHERE campañas.nombre_campaña LIKE @query
        ORDER BY campañas.fecha_inicio DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );
    return { data: result.recordset as Campaign[], pages };
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
      SELECT * FROM campañas WHERE fecha_inicio <= GETDATE() AND fecha_termino >= GETDATE()
      `);
    return { data: result.recordset as Campaign[] };
  } catch (error) {
    console.error("Error al obtener campañas activas:", error);
    return { data: [] };
  }
}
