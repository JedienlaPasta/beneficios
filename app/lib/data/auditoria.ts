import sql from "mssql";
import { connectToDB } from "../utils/db-connection";
import { Activity } from "../definitions";

export async function fetchUserActivityById(
  userId: string,
  query: string,
  currentPage: number,
  resultsPerPage: number,
): Promise<{ data: Activity[]; pages: number }> {
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }
    const request = pool.request();

    const result = await request
      .input("userId", sql.UniqueIdentifier, userId)
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT accion, comentario_accion, comentario_nombre, fecha, id_usuario, nombre_usuario, id_registro_mod,
        COUNT(*) OVER() AS total
        FROM auditoria
        WHERE
          id_usuario = @userId AND
          (
            accion LIKE @query OR
            id_registro_mod LIKE @query OR
            comentario_accion COLLATE Modern_Spanish_CI_AI LIKE @query OR
            comentario_nombre COLLATE Modern_Spanish_CI_AI LIKE @query
          )
        ORDER BY fecha DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );

    return { data: result.recordset as Activity[], pages };
  } catch (error) {
    console.error("Database Error:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchActivity(
  query: string,
  currentPage: number,
  resultsPerPage: number,
): Promise<{ data: Activity[]; pages: number }> {
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }
    const request = pool.request();

    const result = await request
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT accion, comentario_accion, comentario_nombre, fecha, id_usuario, nombre_usuario, id_registro_mod,
        COUNT(*) OVER() AS total
        FROM auditoria
        WHERE
          nombre_usuario LIKE @query OR
          accion LIKE @query OR
          id_registro_mod LIKE @query
        ORDER BY fecha DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const data = result.recordset;
    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );

    return { data: result.recordset as Activity[], pages };
  } catch (error) {
    console.error("Database Error:", error);
    return { data: [], pages: 0 };
  }
}
