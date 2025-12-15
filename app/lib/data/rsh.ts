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
  searchBy:
    | "todos"
    | "rut"
    | "nombre"
    | "direccion"
    | "sector"
    | "folio" = "todos",
): Promise<{ data: RSH[]; pages: number }> {
  console.log(searchBy);
  const flattenQuery = query.replace(/[.]/g, "");
  if (flattenQuery.length === 8) query = flattenQuery.slice(0, 7);
  if (flattenQuery.length === 9) query = flattenQuery.slice(0, 8);
  else query = flattenQuery;

  try {
    const pool = await connectToDB();
    if (!pool) {
      console.warn("No se pudo establecer una conexión a la base de datos.");
      return { data: [], pages: 0 };
    }

    // Verificar disponibilidad de Full-Text Search
    // const ftsCheck = await pool
    //   .request()
    //   .query("SELECT FULLTEXTSERVICEPROPERTY('IsFullTextInstalled') AS ft");
    // const ftsAvailable = ftsCheck.recordset?.[0]?.ft === 1;

    const hasDigits = /\d/.test(query);
    const cleanedRut = hasDigits ? query.replace(/\D/g, "") : "";
    const offset = (currentPage - 1) * resultsPerPage;

    const queryWithoutPercent = query.replace(/%/g, "").trim();
    const searchTerms = queryWithoutPercent
      .split(" ")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Preparar requests y parámetros
    const countRequest = pool.request();
    const dataRequest = pool.request();

    // Construcción dinámica del WHERE
    const whereParts: string[] = [];

    if (searchBy === "rut") {
      if (cleanedRut.length > 0) {
        whereParts.push("rsh.rut LIKE @rutPrefix");
        countRequest.input("rutPrefix", sql.VarChar, `${cleanedRut}%`);
        dataRequest.input("rutPrefix", sql.VarChar, `${cleanedRut}%`);
      } else {
        // Si no hay dígitos, evita devolver todo
        whereParts.push("1 = 0");
      }
    } else if (searchBy === "nombre") {
      if (searchTerms.length > 0) {
        // Un término: prefijo; dos o más: buscar en cualquier parte
        const useAnywhere = searchTerms.length >= 2;
        const clauses: string[] = [];

        searchTerms.forEach((term, idx) => {
          const param = `term${idx}`;
          const pattern = useAnywhere ? `%${term}%` : `${term}%`;

          clauses.push(
            `(rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @${param} OR rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @${param})`,
          );
          countRequest.input(param, sql.NVarChar, pattern);
          dataRequest.input(param, sql.NVarChar, pattern);
        });

        // Requiere que todos los términos aparezcan (en nombres o apellidos)
        whereParts.push(clauses.join(" AND "));
      } else {
        whereParts.push("1 = 0");
      }
    } else if (searchBy === "direccion") {
      whereParts.push(
        "rsh.direccion COLLATE Modern_Spanish_CI_AI LIKE @queryPrefix",
      );
      countRequest.input(
        "queryPrefix",
        sql.NVarChar,
        `${queryWithoutPercent}%`,
      );
      dataRequest.input("queryPrefix", sql.NVarChar, `${queryWithoutPercent}%`);
    } else if (searchBy === "sector") {
      whereParts.push(
        "rsh.sector COLLATE Modern_Spanish_CI_AI LIKE @queryPrefix",
      );
      countRequest.input(
        "queryPrefix",
        sql.NVarChar,
        `${queryWithoutPercent}%`,
      );
      dataRequest.input("queryPrefix", sql.NVarChar, `${queryWithoutPercent}%`);
    } else if (searchBy === "folio") {
      whereParts.push("rsh.folio LIKE @queryPrefix");
      countRequest.input(
        "queryPrefix",
        sql.NVarChar,
        `${queryWithoutPercent}%`,
      );
      dataRequest.input("queryPrefix", sql.NVarChar, `${queryWithoutPercent}%`);
    } else {
      // Modo "todos": OR reducido y prefijos (evitar CONCAT)
      countRequest.input(
        "queryPrefix",
        sql.NVarChar,
        `${queryWithoutPercent}%`,
      );
      dataRequest.input("queryPrefix", sql.NVarChar, `${queryWithoutPercent}%`);
      if (hasDigits && cleanedRut.length > 0) {
        whereParts.push("rsh.rut LIKE @rutPrefix");
        countRequest.input("rutPrefix", sql.VarChar, `${cleanedRut}%`);
        dataRequest.input("rutPrefix", sql.VarChar, `${cleanedRut}%`);
      }
      whereParts.push("rsh.folio LIKE @queryPrefix");
      whereParts.push(
        "rsh.direccion COLLATE Modern_Spanish_CI_AI LIKE @queryPrefix",
      );
      whereParts.push(
        "rsh.sector COLLATE Modern_Spanish_CI_AI LIKE @queryPrefix",
      );
      whereParts.push(
        "rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @queryPrefix",
      );
      whereParts.push(
        "rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @queryPrefix",
      );
    }

    const whereClause =
      whereParts.length > 0 ? whereParts.join(" OR ") : "1 = 0";

    // Conteo total
    const countResult = await countRequest.query(`
      SELECT COUNT(*) as total
      FROM rsh
      LEFT JOIN rsh_mods mods ON rsh.rut = mods.rut
      WHERE ${whereClause}
    `);

    const total: number = countResult.recordset[0]?.total ?? 0;

    // Datos paginados (OUTER APPLY para última entrega con índice en entregas(rut, fecha_entrega))
    const result = await dataRequest
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
          OUTER APPLY (
            SELECT TOP 1 fecha_entrega AS ultima_entrega
            FROM entregas
            WHERE rut = rsh.rut
            ORDER BY fecha_entrega DESC
          ) ent_max
          WHERE ${whereClause}
        ) AS NumberedResults
        WHERE RowNum BETWEEN @startRow AND @endRow
      `);

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
