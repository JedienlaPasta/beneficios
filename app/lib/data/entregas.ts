import sql from "mssql";
import {
  SocialAid,
  SocialAidByFolio,
  SocialAidTableRow,
  SocialAidTableRowByFolio,
  SocialFiles,
} from "../definitions";
import { connectToDB } from "../utils/db-connection";

//
//
//
//
//
// rsh.nombres??
// rsh.nombres??
// rsh.nombres??
// rsh.nombres??
// rsh.nombres??
//

// export async function fetchSocialAidById(id: string) {
//   try {
//     const pool = await connectToDB();
//     const request = pool.request();
//     const result = await request
//       .input("id", sql.NVarChar, id)
//       .query(`SELECT * FROM rsh WHERE rut = @id`);

//     return { data: result.recordset[0] as SocialAid };
//   } catch (error) {
//     console.error("Error al obtener datos de la tabla de entregas:", error);
//     return { data: {} };
//   }
// }

export async function fetchSocialAids(
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
        SELECT *
        FROM entregas
        ORDER BY entregas.fecha_entrega DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );
    return { data: result.recordset as SocialAid[], pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchSocialAidsByRUT(
  rut: string,
  query: string,
  currentPage: number,
  resultsPerPage: number,
) {
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request
      .input("rut", sql.NVarChar, rut)
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT entregas.folio, entregas.fecha_entrega, entregas.estado_documentos, usuarios.nombre_usuario,
        COUNT (*) OVER() AS total 
        FROM entregas
        LEFT JOIN usuarios ON entregas.id_usuario = usuarios.id
        WHERE 
          entregas.rut = @rut AND
          entregas.folio LIKE @query
        ORDER BY entregas.fecha_entrega DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
      `);

    const pages = Math.ceil(
      Number(result.recordset[0]?.total) / resultsPerPage,
    );
    return { data: result.recordset as SocialAidTableRow[], pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

// Returns Entregas[] de length = 1
export async function fetchSocialAidsGeneralInfoByFolio(folio: string) {
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
export async function fetchSocialAidsInfoByFolio(folio: string) {
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
export async function fetchSocialAidsForCampaignDetail(
  id: string,
  query: string,
  currentPage: number,
  resultsPerPage: number,
) {
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const pool = await connectToDB();
    const request = pool.request();
    const result = await request
      .input("id", sql.NVarChar, id)
      .input("query", sql.NVarChar, `%${query}%`)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, resultsPerPage).query(`
        SELECT rsh.nombres_rsh, rsh.apellidos_rsh, rsh.rut, entregas.folio, entregas.fecha_entrega,
        COUNT (*) OVER() AS total
        FROM entregas
        JOIN entrega ON entrega.folio = entregas.folio
        JOIN rsh ON rsh.rut = entregas.rut
        WHERE
          entrega.id_campaña = @id 
          AND (
            rsh.nombres_rsh LIKE @query OR
            rsh.apellidos_rsh LIKE @query OR
            rsh.rut LIKE @query OR
            entregas.folio LIKE @query
          )
        ORDER BY entregas.fecha_entrega DESC
        OFFSET @offset ROWS
        FETCH NEXT @pageSize ROWS ONLY
        `);

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
