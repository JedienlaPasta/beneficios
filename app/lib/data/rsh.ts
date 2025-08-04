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

  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }

    const hasDigits = /\d/.test(query);
    const cleanedRut = hasDigits ? query.replace(/\D/g, "") : "";
    const offset = (currentPage - 1) * resultsPerPage;

    const queryWithoutPercent = query.replace(/%/g, "");
    const searchTerms = queryWithoutPercent
      .split(" ")
      .filter((term) => term.trim().length > 0);

    // Primero obtener el conteo total (query separada más eficiente)
    const countRequest = pool.request();
    const countResult = await countRequest
      .input("query", sql.NVarChar, `%${query}%`)
      .input("cleanedRut", sql.VarChar, `%${cleanedRut}%`).query(`
        SELECT COUNT(*) as total
        FROM rsh
        LEFT JOIN rsh_mods mods ON rsh.rut = mods.rut
        WHERE 
          ${hasDigits ? "concat (rsh.rut, rsh.dv) LIKE @cleanedRut OR" : ""}
          rsh.folio LIKE @query OR
          rsh.direccion COLLATE Modern_Spanish_CI_AI LIKE @query OR
          rsh.sector COLLATE Modern_Spanish_CI_AI LIKE @query OR
          rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
          rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
          concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) COLLATE Modern_Spanish_CI_AI LIKE @query
          ${
            searchTerms.length > 1
              ? `OR (
            ${searchTerms
              .map(
                (term) =>
                  `(rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE '%${term}%' OR rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE '%${term}%')`,
              )
              .join(" AND ")}
          )`
              : ""
          }
      `);

    const total: number = countResult.recordset[0].total;

    // Luego obtener los datos paginados con JOIN optimizado
    const dataRequest = pool.request();
    const result = await dataRequest
      .input("query", sql.NVarChar, `%${query}%`)
      .input("cleanedRut", sql.VarChar, `%${cleanedRut}%`)
      .input("startRow", sql.Int, offset + 1)
      .input("endRow", sql.Int, offset + resultsPerPage).query(`
        SELECT * FROM (
          SELECT 
            rsh.rut, rsh.dv, rsh.nombres_rsh, rsh.apellidos_rsh, rsh.direccion, rsh.sector, rsh.tramo,
            ent_max.ultima_entrega,
            mods.direccion_mod, mods.sector_mod, mods.telefono_mod, mods.correo_mod,
            ROW_NUMBER() OVER (ORDER BY rsh.apellidos_rsh ASC) AS RowNum
          FROM rsh
          LEFT JOIN rsh_mods mods ON rsh.rut = mods.rut
          LEFT JOIN (
            SELECT rut, MAX(fecha_entrega) as ultima_entrega
            FROM entregas
            GROUP BY rut
          ) ent_max ON rsh.rut = ent_max.rut
          WHERE 
            ${hasDigits ? "concat (rsh.rut, rsh.dv) LIKE @cleanedRut OR" : ""}
            rsh.folio LIKE @query OR
            rsh.direccion COLLATE Modern_Spanish_CI_AI LIKE @query OR
            rsh.sector COLLATE Modern_Spanish_CI_AI LIKE @query OR
            rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
            rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
            concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) COLLATE Modern_Spanish_CI_AI LIKE @query
            ${
              searchTerms.length > 1
                ? `OR (
              ${searchTerms
                .map(
                  (term) =>
                    `(rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE '%${term}%' OR rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE '%${term}%')`,
                )
                .join(" AND ")}
            )`
                : ""
            }
        ) AS NumberedResults
        WHERE RowNum BETWEEN @startRow AND @endRow
      `);

    // Agregar el total a cada registro
    const pages = Math.ceil(total / resultsPerPage);
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
