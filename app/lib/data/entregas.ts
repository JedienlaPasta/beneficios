import sql from "mssql";
import {
  SocialAid,
  SocialAidByFolio,
  SocialAidTableRow,
  SocialAidTableRowByFolio,
  SocialFiles,
} from "../definitions";
import { connectToDB } from "../utils/db-connection";

export async function fetchEntrega(folio: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request.input("folio", sql.NVarChar, `%${folio}%`)
      .query(`
        SELECT TOP 1 entregas.folio, entregas.fecha_entrega, entregas.estado_documentos, entregas.rut, rsh.nombres_rsh, rsh.apellidos_rsh
        FROM entregas
        JOIN rsh ON entregas.rut = rsh.rut
        WHERE
          entregas.folio = @folio
      `);

    return { data: result.recordset };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

// No se usa?
export async function fetchEntregas(
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
        SELECT entregas.folio, entregas.fecha_entrega, entregas.estado_documentos, entregas.rut, rsh.nombres_rsh, rsh.apellidos_rsh,
        COUNT(*) OVER() AS total
        FROM entregas
        JOIN rsh ON entregas.rut = rsh.rut
        WHERE
          entregas.rut LIKE @query OR
          entregas.folio LIKE @query OR
          rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR 
          rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR 
          concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) COLLATE Modern_Spanish_CI_AI LIKE @query
        ORDER BY entregas.fecha_entrega DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    let pages = 0;
    if (result.recordset.length > 0) {
      pages = Math.ceil(Number(result.recordset[0]?.total) / resultsPerPage);
    }
    return { data: result.recordset, pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchEntregasByRUT(
  rut: string,
  query: string,
  currentPage: number,
  resultsPerPage: number,
) {
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    const request = pool.request();

    const countQuery =
      currentPage === 1
        ? `COUNT(*) OVER() AS total`
        : `CAST(0 AS INT) AS total`;

    const result = await request
      .input("rut", sql.NVarChar, rut)
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT 
          entregas.folio, 
          entregas.fecha_entrega, 
          entregas.estado_documentos, 
          usuarios.nombre_usuario,
          ${countQuery}
        FROM entregas WITH (INDEX(IX_entregas_rut_folio))
        LEFT JOIN usuarios ON entregas.id_usuario = usuarios.id
        WHERE 
          entregas.rut = @rut AND
          entregas.folio LIKE @query
        ORDER BY entregas.fecha_entrega DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    // If we're not on the first page, we need to get the total count separately
    let pages = 0;
    if (currentPage === 1 && result.recordset.length > 0) {
      pages = Math.ceil(Number(result.recordset[0]?.total) / resultsPerPage);
    } else if (currentPage > 1) {
      // Only execute count query when needed (not on first page)
      const countResult = await request
        .input("rut", sql.NVarChar, rut)
        .input("query", sql.NVarChar, `%${query}%`).query(`
          SELECT COUNT(*) AS total
          FROM entregas
          WHERE 
            entregas.rut = @rut AND
            entregas.folio LIKE @query
        `);
      pages = Math.ceil(
        Number(countResult.recordset[0]?.total) / resultsPerPage,
      );
    }

    return { data: result.recordset as SocialAidTableRow[], pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

// Returns Entregas[] de length = 1
export async function fetchEntregasGeneralInfoByFolio(folio: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request.input("folio", sql.NVarChar, folio).query(`
        SELECT entregas.folio, entregas.fecha_entrega, entregas.observacion, entregas.estado_documentos, usuarios.nombre_usuario
        FROM entregas
        LEFT JOIN usuarios ON entregas.id_usuario = usuarios.id
        WHERE entregas.folio = @folio
      `);

    return { data: result.recordset as SocialAidTableRowByFolio[] };
  } catch (error) {
    console.error("Error al obtener datos de las entregas: ", error);
    return { data: [], pages: 0 };
  }
}

// Returns Entrega[] de length = los que hayan
export async function fetchEntregasInfoByFolio(folio: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request.input("folio", sql.NVarChar, folio).query(`
        SELECT entrega.id_campaña, entrega.detalle, campañas.tipo_dato, campañas.nombre_campaña
        FROM entrega
        LEFT JOIN campañas ON entrega.id_campaña = campañas.id
        WHERE entrega.folio = @folio
      `);

    return { data: result.recordset as SocialAidByFolio[] };
  } catch (error) {
    console.error("Error al obtener datos de las entregas: ", error);
    return { data: [], pages: 0 };
  }
}

// Tabla de Detalle de Campaña.
export async function fetchEntregasForCampaignDetail(
  id: string,
  query: string,
  currentPage: number,
  resultsPerPage: number,
) {
  const flattenQuery = query.replace(/[.]/g, "");
  // si no se agrega el dv no son necesarios estos slice
  if (flattenQuery.length === 8) query = flattenQuery.slice(0, 7);
  if (flattenQuery.length === 9) query = flattenQuery.slice(0, 8);
  else query = flattenQuery;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request
      .input("id", sql.UniqueIdentifier, id) // Changed to UniqueIdentifier if id is a UUID
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT 
          rsh.nombres_rsh, 
          rsh.apellidos_rsh, 
          rsh.rut, 
          entregas.folio, 
          entregas.fecha_entrega,
          COUNT(*) OVER() AS total
        FROM entregas
        JOIN entrega ON entrega.folio = entregas.folio
        JOIN rsh ON rsh.rut = entregas.rut
        WHERE
          entrega.id_campaña = @id 
          AND (
            rsh.rut LIKE @query OR
            entregas.folio LIKE @query OR
            rsh.nombres_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
            rsh.apellidos_rsh COLLATE Modern_Spanish_CI_AI LIKE @query OR
            concat(rsh.nombres_rsh,' ', rsh.apellidos_rsh) COLLATE Modern_Spanish_CI_AI LIKE @query
          )
        ORDER BY entregas.fecha_entrega DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    // Early return if no results
    if (result.recordset.length === 0) {
      return { data: [], pages: 0 };
    }

    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );
    return { data: result.recordset as SocialAid[], pages };
  } catch (error) {
    console.error("Error al obtener entregas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchFilesByFolio(folio: string) {
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = request.input("folio", sql.NVarChar, folio).query(`
        SELECT documentos.fecha_guardado, documentos.nombre_documento, documentos.tipo, documentos.id
        FROM documentos
        WHERE documentos.folio = @folio`);

    return { data: (await result).recordset as SocialFiles[] };
  } catch (error) {
    console.error("Error al obtener archivos:", error);
    return { data: [] };
  }
}
