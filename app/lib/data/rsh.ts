import sql from "mssql";
import { RSH, RSHInfo } from "../definitions";
import { connectToDB } from "../utils/db-connection";

export async function fetchRSHByRUT(rut: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request.input("rut", sql.Int, rut).query(`
        SELECT rsh.*,
        (SELECT MAX(fecha_entrega) FROM entregas WHERE rut = @rut) AS ultima_entrega
        FROM rsh
        WHERE rsh.rut = @rut
      `);

    return { data: result.recordset as RSH[] };
  } catch (error) {
    console.error("Error al obtener registro social de hogares: ", error);
    return { data: [] };
  }
}

export async function fetchRSH(
  query: string,
  currentPage: number,
  resultsPerPage: number,
) {
  const flattenQuery = query.replace(/[.]/g, "");
  // si no se agrega el dv no son necesarios estos slice
  if (flattenQuery.length === 8) query = flattenQuery.slice(0, 7);
  if (flattenQuery.length === 9) query = flattenQuery.slice(0, 8);
  else query = flattenQuery;
  const offset = (currentPage - 1) * resultsPerPage || 0;
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT rsh.rut, rsh.dv, rsh.nombres_rsh, rsh.apellidos_rsh, rsh.direccion, rsh.sector, rsh.tramo,
        (SELECT MAX(entregas.fecha_entrega) FROM entregas WHERE entregas.rut = rsh.rut) AS ultima_entrega,
        COUNT (*) OVER() AS total
        FROM rsh
        WHERE concat(rsh.rut,' ', rsh.nombres_rsh,' ', rsh.apellidos_rsh,' ', rsh.direccion) LIKE @query
        ORDER BY rsh.apellidos_rsh ASC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
        `);

    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );
    return { data: result.recordset as RSH[], pages };
  } catch (error) {
    console.error("Error al obtener registro social de hogares: ", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchRSHCount() {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request.query(`
      SELECT COUNT(*) AS total_registros FROM rsh`);

    // Check if result.recordset has data before returning
    if (result.recordset && result.recordset.length > 0) {
      return {
        data: result.recordset as RSHInfo[],
      };
    } else {
      return {
        data: [{ total_registros: 0 }],
      };
    }
  } catch (error) {
    console.error("Error al obtener total de registros de rsh:", error);
    return {
      data: [{ total_registros: 0 }],
    };
  }
}

export async function fetchRSHLastUpdate() {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request.query(`
      SELECT TOP 1 rsh_info.ultima_actualizacion FROM rsh_info
    `);

    if (result.recordset && result.recordset.length > 0) {
      return {
        data: result.recordset as RSHInfo[],
      };
    } else {
      return {
        data: [{ ultima_actualizacion: null }],
      };
    }
  } catch (error) {
    console.error("Error al obtener ultima fecha de actualizacion:", error);
    return {
      data: [
        {
          ultima_actualizacion: null,
        },
      ],
    };
  }
}
