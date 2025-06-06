import sql from "mssql";
import { RSH, RSHInfo } from "../definitions";
import { connectToDB } from "../utils/db-connection";

export async function fetchRSHByRUT(rut: string): Promise<RSH> {
  const defaultRSH: RSH = {
    nombres_rsh: "",
    apellidos_rsh: "",
    rut: null,
    dv: "",
    direccion: "",
    direccion_mod: "",
    sector: "",
    sector_mod: "",
    tramo: null,
    telefono: "",
    telefono_mod: "",
    fecha_nacimiento: null,
    genero: "",
    correo: "",
    correo_mod: "",
    indigena: "",
    ultima_entrega: null,
    folio: "",
    nacionalidad: "",
  };
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return defaultRSH;
    }

    const request = pool.request();
    const result = await request.input("rut", sql.Int, rut).query(`
        SELECT rsh.*,
        mods.direccion_mod, mods.sector_mod, mods.telefono_mod, mods.correo_mod,
        (SELECT MAX(fecha_entrega) FROM entregas WHERE rut = @rut) AS ultima_entrega
        FROM rsh
        LEFT JOIN rsh_mods mods ON rsh.rut = mods.rut
        WHERE rsh.rut = @rut
      `);

    return result.recordset[0] as RSH;
  } catch (error) {
    console.error("Error al obtener registro social de hogares: ", error);
    return defaultRSH;
  }
}

export async function fetchRSH(
  query: string,
  currentPage: number,
  resultsPerPage: number,
): Promise<{ data: RSH[]; pages: number }> {
  const flattenQuery = query.replace(/[.]/g, "");
  // si no se agrega el dv no son necesarios estos slice
  if (flattenQuery.length === 8) query = flattenQuery.slice(0, 7);
  if (flattenQuery.length === 9) query = flattenQuery.slice(0, 8);
  else query = flattenQuery;
  const offset = (currentPage - 1) * resultsPerPage || 0;
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
        SELECT rsh.rut, rsh.dv, rsh.nombres_rsh, rsh.apellidos_rsh, rsh.direccion, rsh.sector, rsh.tramo,
        (SELECT MAX(entregas.fecha_entrega) FROM entregas WHERE entregas.rut = rsh.rut) AS ultima_entrega,
        mods.direccion_mod, mods.sector_mod, mods.telefono_mod, mods.correo_mod,
        COUNT (*) OVER() AS total
        FROM rsh
        LEFT JOIN rsh_mods mods ON rsh.rut = mods.rut
        WHERE 
          rsh.rut LIKE @query OR
          rsh.direccion COLLATE Modern_Spanish_CI_AI LIKE @query OR
          rsh.sector COLLATE Modern_Spanish_CI_AI LIKE @query OR
          rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
          rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
          concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) COLLATE Modern_Spanish_CI_AI LIKE @query
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

export async function fetchRSHCount(): Promise<RSHInfo> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { ultima_actualizacion: null, total_registros: 0 };
    }

    const request = pool.request();
    const result = await request.query(`
      SELECT COUNT(*) AS total_registros FROM rsh`);

    // Check if result.recordset has data before returning
    if (result.recordset && result.recordset.length > 0) {
      return result.recordset[0] as RSHInfo;
    } else {
      return { ultima_actualizacion: null, total_registros: 0 };
    }
  } catch (error) {
    console.error("Error al obtener total de registros de rsh:", error);
    return { ultima_actualizacion: null, total_registros: 0 };
  }
}

export async function fetchRSHLastUpdate() {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { ultima_actualizacion: null, total_registros: 0 };
    }

    const request = pool.request();
    const result = await request.query(`
      SELECT TOP 1 rsh_info.ultima_actualizacion FROM rsh_info
    `);

    if (result.recordset && result.recordset.length > 0) {
      return result.recordset[0] as RSHInfo;
    } else {
      return { ultima_actualizacion: null, total_registros: 0 };
    }
  } catch (error) {
    console.error("Error al obtener ultima fecha de actualizacion:", error);
    return { ultima_actualizacion: null, total_registros: 0 };
  }
}
