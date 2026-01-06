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

type ActiveCampaigns = {
  id: string;
  nombre_campaña: string;
  fecha_inicio: Date;
  fecha_termino: Date;
  total_entregas: number;
};

export async function getActiveCampaigns(): Promise<ActiveCampaigns[]> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return [];
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const request = pool.request();

    // Inyectamos fechas para el conteo
    request.input("startDate", sql.DateTime, startOfYear);
    request.input("endDate", sql.DateTime, endOfYear);

    const result = await request.query(`
      SELECT 
        c.id,
        c.nombre_campaña,
        c.fecha_inicio,
        c.fecha_termino,
        
        -- SUBCONSULTA: Cuenta las entregas solo de este año para esta campaña
        (
            SELECT COUNT(*)
            FROM beneficios_entregados be
            INNER JOIN entregas e ON be.folio = e.folio
            WHERE be.id_campaña = c.id
              AND e.estado_documentos <> 'Anulado'
              AND e.fecha_entrega BETWEEN @startDate AND @endDate
        ) as total_entregas

      FROM campañas c
      WHERE c.fecha_inicio <= GETUTCDATE() 
        AND c.fecha_termino >= CAST(GETUTCDATE() AS DATE)
      ORDER BY c.fecha_inicio DESC
    `);

    return result.recordset as ActiveCampaigns[];
  } catch (error) {
    console.error("Error al obtener campañas activas:", error);
    return [];
  }
}

export type ActiveCampaignsForEntregas = {
  id: string;
  nombre_campaña: string;
  code: string;
  stock: number;
  total_entregas: number;
  esquema_formulario: string;
};

export async function getActiveCampaignsForEntregas(): Promise<
  ActiveCampaignsForEntregas[]
> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return [];
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const request = pool.request();

    // Inyectamos fechas para el conteo
    request.input("startDate", sql.DateTime, startOfYear);
    request.input("endDate", sql.DateTime, endOfYear);

    const result = await request.query(`
      SELECT 
        c.id,
        c.nombre_campaña,
        c.code,
        c.stock,
        c.esquema_formulario,
        
        -- SUBCONSULTA: Cuenta las entregas solo de este año para esta campaña
        (
            SELECT COUNT(*)
            FROM beneficios_entregados be
            INNER JOIN entregas e ON be.folio = e.folio
            WHERE be.id_campaña = c.id
              AND e.estado_documentos <> 'Anulado'
              AND e.fecha_entrega BETWEEN @startDate AND @endDate
        ) as total_entregas

      FROM campañas c
      WHERE c.fecha_inicio <= GETUTCDATE() 
        AND c.fecha_termino >= CAST(GETUTCDATE() AS DATE)
      ORDER BY c.fecha_inicio DESC
    `);

    // Mapeo seguro de datos
    const campaigns: ActiveCampaignsForEntregas[] = result.recordset.map(
      (row) => ({
        id: row.id,
        nombre_campaña: row.nombre_campaña,
        code: row.code,
        stock: row.stock,
        total_entregas: row.total_entregas ?? 0,
        esquema_formulario: row.esquema_formulario || "",
      }),
    );

    return campaigns;
  } catch (error) {
    console.error("Error al obtener campañas activas:", error);
    return [];
  }
}
