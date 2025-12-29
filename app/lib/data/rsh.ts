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

// Método: fetchRSH
export async function fetchRSH(
  query: string,
  currentPage: number,
  resultsPerPage: number,
): Promise<{ data: RSH[]; pages: number }> {
  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }

    // Preparación de variables
    const offset = (currentPage - 1) * resultsPerPage;

    const rawInput = query.trim();

    // Validaciones para el RUT y Folio
    const hasDigits = /\d/.test(query.trim());
    const isRutValidValue = /^[0-9kK.\-]+$/.test(query.trim());
    const isTooShortText =
      rawInput.length > 0 && !hasDigits && rawInput.length < 3;

    const trimmedQuery = isTooShortText ? "" : rawInput;

    // Validaciones Numéricas y Limpieza para Folio
    const cleanQueryForNumber = trimmedQuery.replace(/['"]/g, "");
    const isExactFolioRSH = /^\d{8}$/.test(cleanQueryForNumber);

    const rutRaw = trimmedQuery.replace(/[^0-9kK]/g, "");

    let rutFormatted: string | null = null;
    if (trimmedQuery.includes("-")) {
      rutFormatted = trimmedQuery.replace(/\./g, "");
    } else if (rutRaw.length > 7) {
      const base = rutRaw.slice(0, -1);
      const dv = rutRaw.slice(-1);
      rutFormatted = `${base}-${dv}`;
    }

    const rawTerms = trimmedQuery
      .replace(/["*]/g, "")
      .split(/\s+/)
      .filter((term) => term.length > 0);

    // Construcción dinámica del WHERE
    const whereClauses: string[] = [];

    // Filtro de Búsqueda (Texto y RUT)
    if (trimmedQuery) {
      const searchConditions: string[] = [];

      // 1. Búsqueda por RUT
      if (hasDigits && isRutValidValue) {
        if (rutFormatted) {
          searchConditions.push(
            `rsh.rut_completo LIKE @rutRaw OR rsh.rut_completo LIKE @rutFormatted`,
          );
        } else {
          searchConditions.push(`rsh.rut_completo LIKE @rutRaw`);
        }
      }

      // 2. Búsqueda por Folio
      if (isExactFolioRSH) {
        searchConditions.push(`rsh.folio = @folioRshExacto`);
      }

      // 3. Búsqueda Full-Text Search (Nombres y Apellidos)
      if (rawTerms.length > 0 && !isRutValidValue) {
        const ftsQueryString = rawTerms
          .map(
            (_, index) =>
              `CONTAINS((rsh.nombres_rsh, rsh.apellidos_rsh), @ftsTerm${index})`,
          )
          .join(" AND ");

        searchConditions.push(`(${ftsQueryString})`);
      }

      // Unimos todas las condiciones de búsqueda con OR y las envolvemos en paréntesis
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
        if (hasDigits && isRutValidValue) {
          req.input("rutRaw", sql.VarChar, `${rutRaw}%`); // el % al final permite autocompletar
          if (rutFormatted) {
            req.input("rutFormatted", sql.VarChar, `${rutFormatted}%`);
          }
        }

        // Parámetro para folio exacto
        if (isExactFolioRSH) {
          req.input("folioRshExacto", sql.Int, parseInt(cleanQueryForNumber));
        }

        // Para Full-Text Search (Cadena formateada)
        if (rawTerms.length > 0 && !isRutValidValue) {
          rawTerms.forEach((term, index) => {
            req.input(`ftsTerm${index}`, sql.VarChar, `"${term}*"`);
          });
        }
      }
      return req;
    };

    // Ejecución (count)
    const countRequest = bindParams(pool.request());
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM rsh
      LEFT JOIN rsh_mods mods ON rsh.rut = mods.rut
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
            SELECT rsh.rut
            FROM rsh
            ${whereSql}
            ORDER BY rsh.apellidos_rsh ASC, rsh.nombres_rsh ASC
            OFFSET @offset ROWS
            FETCH NEXT @limit ROWS ONLY
        )
        -- QUERY PRINCIPAL: Ahora se buscan solo los RUTs paginados con la data pesada.
        SELECT 
          rsh.rut,
          rsh.dv,
          rsh.rut_completo,
          rsh.folio,
          rsh.nombres_rsh,
          rsh.apellidos_rsh,
          rsh.direccion,
          rsh.sector,
          rsh.tramo,
          rsh.correo,
          mods.direccion_mod,
          mods.sector_mod,
          mods.telefono_mod,
          mods.correo_mod,
          (SELECT MAX(fecha_entrega) FROM entregas WHERE entregas.rut = rsh.rut) AS ultima_entrega
        FROM Paginacion
        JOIN rsh ON Paginacion.rut = rsh.rut
        LEFT JOIN rsh_mods mods ON rsh.rut = mods.rut
        ORDER BY rsh.apellidos_rsh ASC, rsh.nombres_rsh ASC
      `);

    return {
      data: result.recordset as RSH[],
      pages: Math.ceil(total / resultsPerPage),
    };
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
