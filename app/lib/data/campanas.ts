import { Campaign } from "../definitions";
import { connectToDB } from "../utils/db-connection";
import sql from "mssql";

export async function fetchCampaignById(id: string): Promise<Campaign> {
  const defaultCampaign: Campaign = {
    id: "",
    nombre_campaña: "",
    fecha_inicio: null,
    fecha_termino: null,
    estado: "",
    entregas: null,
    code: "",
    stock: null,
    tipo_dato: "",
    tramo: "",
    esquema_formulario: "",
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

    const rawInput = query.trim();
    const isUUID =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        rawInput,
      );

    const isTooShortText =
      rawInput.length > 0 && !isUUID && rawInput.length < 3;

    const trimmedQuery = isTooShortText ? "" : rawInput;

    // Construcción dinámica del WHERE
    const whereClauses: string[] = [];

    if (trimmedQuery) {
      const searchConditions: string[] = [];

      if (isUUID) {
        searchConditions.push(`c.id = @exactId`);
      } else {
        searchConditions.push(`c.nombre_campaña LIKE @queryLike`);
      }

      if (searchConditions.length > 0) {
        whereClauses.push(`(${searchConditions.join(" OR ")})`);
      }
    }

    // Unir todas las cláusulas WHERE con AND
    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // Binding de Parámetros
    const bindParams = (req: sql.Request) => {
      if (trimmedQuery) {
        if (isUUID) {
          req.input("exactId", sql.UniqueIdentifier, trimmedQuery);
        } else {
          req.input("queryLike", sql.NVarChar, `%${trimmedQuery}%`);
        }
      }
      return req;
    };

    // Ejecución (count)
    const countRequest = bindParams(pool.request());
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM campañas c
      ${whereSql}
    `);

    const total = countResult.recordset[0].total;
    if (total === 0) return { data: [], pages: 0 }; // return rápido si no hay resultados

    // Ejecución (Data Paginada)
    const dataRequest = bindParams(pool.request());
    dataRequest.input("offset", sql.Int, offset);
    dataRequest.input("limit", sql.Int, resultsPerPage);

    const result = await dataRequest.query(`
      WITH Paginacion AS (
          SELECT c.id
          FROM campañas c
          ${whereSql}
          ORDER BY c.fecha_inicio DESC
          OFFSET @offset ROWS
          FETCH NEXT @limit ROWS ONLY
      )
      SELECT 
        c.*,
        -- Cálculo de Estado en vuelo (SQL Server)
        CASE 
          WHEN c.fecha_inicio > GETUTCDATE() THEN 'Pendiente'
          WHEN c.fecha_inicio <= GETUTCDATE() AND c.fecha_termino >= CAST(GETUTCDATE() AS DATE) THEN 'En Curso'
          ELSE 'Finalizada'
        END AS estado,
        (SELECT COUNT(*) FROM beneficios_entregados b WHERE b.id_campaña = c.id) AS total_entregas
      FROM Paginacion p
      JOIN campañas c ON p.id = c.id
      ORDER BY c.fecha_inicio DESC
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
      WHERE fecha_inicio <= GETUTCDATE() AND fecha_termino >= CAST(GETUTCDATE() AS DATE)
      ORDER BY fecha_inicio DESC
      `);
    return result.recordset as Campaign[];
  } catch (error) {
    console.error("Error al obtener campañas activas:", error);
    return [];
  }
}
