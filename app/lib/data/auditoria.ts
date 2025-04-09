import sql from "mssql";
import { connectToDB } from "../utils/db-connection";

export async function fetchUserActivityById(
  userId: string,
  query: string,
  currentPage: number,
  resultsPerPage: number,
) {
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    const request = pool.request();

    const result = await request
      .input("userId", sql.NVarChar, userId)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT nombre_usuario, accion, dato, fecha, id_mod,
        COUNT(*) OVER() AS total
        FROM auditoria
        WHERE
          id_usuario = @userId
        ORDER BY fecha DESC
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

export async function fetchActivity(
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
        SELECT nombre_usuario, accion, dato, fecha, id_mod,
        COUNT(*) OVER() AS total
        FROM auditoria
        WHERE
          nombre_usuario LIKE @query
        ORDER BY fecha DESC
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
