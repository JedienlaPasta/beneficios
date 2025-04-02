import sql from "mssql";
import { connectToDB } from "../utils/db-connection";

export async function fetchUserActivity(
  query: string,
  currentPage: number,
  resultsPerPage: number,
) {
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    const request = pool.request();

    const result = await request
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT usuarios.nombre_usuario, auditoria.accion, auditoria.dato, auditoria.fecha, auditoria.id_mod,
        COUNT(*) OVER() AS total
        FROM auditoria
        JOIN usuarios ON auditoria.nombre_usuario = usuarios.nombre_usuario
        WHERE
          usuarios.nombre_usuario LIKE @query OR
          auditoria.dato LIKE @query
        ORDER BY auditoria.fecha DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const data = result.recordset;
    const totalCount = data[0]?.total || 0;
    const pages = Math.ceil(totalCount / resultsPerPage);

    return {
      data,
      pages,
      total: totalCount,
    };
  } catch (error) {
    console.error("Database Error:", error);
    throw new Error("Error al obtener actividades");
  }
}
