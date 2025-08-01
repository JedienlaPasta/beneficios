import { Campaign } from "../definitions";
import { connectToDB } from "../utils/db-connection";
import sql from "mssql";

export async function fetchCampaignById(id: string): Promise<Campaign> {
  const defaultCampaign: Campaign = {
    id: "",
    nombre_campaña: "",
    fecha_inicio: null,
    fecha_termino: null,
    entregas: null,
    code: "",
    stock: null,
    tipo_dato: "",
    tramo: "",
    // estado: "En curso",
    discapacidad: "",
    adulto_mayor: "",
  };
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return defaultCampaign; // Return empty array instead of empty object
    }
    const request = pool.request();

    const result = await request
      .input("id", sql.VarChar, id)
      .query(`SELECT * FROM campañas WHERE id = @id`);

    // Return as an array to maintain consistency with other fetch functions
    return result.recordset[0] as Campaign;
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return defaultCampaign; // Return empty array instead of empty object
  }
}

export async function fetchCampaigns(
  query: string,
  currentPage: number,
  resultsPerPage: number,
): Promise<{ data: Campaign[]; pages: number }> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }

    const offset = (currentPage - 1) * resultsPerPage;

    // Get total count (optimized)
    const countRequest = pool.request();
    const countResult = await countRequest.input(
      "query",
      sql.NVarChar,
      `%${query}%`,
    ).query(`
        SELECT COUNT(*) as total
        FROM campañas
        WHERE nombre_campaña LIKE @query OR id LIKE @query
      `);

    const total: number = countResult.recordset[0].total;

    // Get paginated data with precomputed entregas count (optimized)
    const dataRequest = pool.request();
    const result = await dataRequest
      .input("query", sql.NVarChar, `%${query}%`)
      .input("startRow", sql.Int, offset + 1)
      .input("endRow", sql.Int, offset + resultsPerPage).query(`
        SELECT * FROM (
          SELECT 
            c.*,
            CASE 
              WHEN c.fecha_inicio > GETUTCDATE() THEN 'Pendiente'
              WHEN c.fecha_inicio <= GETUTCDATE() AND c.fecha_termino >= GETUTCDATE() THEN 'En Curso'
              ELSE 'Finalizada'
            END AS estado,
            ISNULL(ent_count.total_entregas, 0) AS total_entregas,
            ROW_NUMBER() OVER (ORDER BY c.fecha_inicio DESC) AS RowNum
          FROM campañas c
          LEFT JOIN (
            SELECT 
              id_campaña, 
              COUNT(*) AS total_entregas 
            FROM entrega 
            GROUP BY id_campaña
          ) ent_count ON c.id = ent_count.id_campaña
          WHERE c.nombre_campaña LIKE @query OR c.id LIKE @query
        ) AS NumberedResults
        WHERE RowNum BETWEEN @startRow AND @endRow
      `);

    const pages = Math.ceil(total / resultsPerPage);
    return { data: result.recordset as Campaign[], pages };
  } catch (error) {
    console.error("Error al obtener campañas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return [];
    }
    const request = pool.request();
    const result = await request.query(`
      SELECT * FROM campañas 
      WHERE fecha_inicio <= GETUTCDATE() AND fecha_termino >= GETUTCDATE()
      ORDER BY fecha_inicio DESC
      `);
    return result.recordset as Campaign[];
  } catch (error) {
    console.error("Error al obtener campañas activas:", error);
    return [];
  }
}
