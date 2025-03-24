import postgres from "postgres";
import {
  SocialAid,
  SocialAidByFolio,
  SocialAidTableRowByFolio,
  SocialFiles,
} from "../definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchSocialAidById(id: string) {
  try {
    const data = await sql<SocialAid[]>`
              SELECT *
              FROM rsh
              WHERE rsh.rut = ${id}
              `;
    return data;
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [] };
  }
}

export async function fetchSocialAids(query: string, currentPage: number) {
  const resultsPerPage = 6;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    console.log("currentPage: ", currentPage);
    const data = await sql<SocialAid[]>`
              SELECT * 
              FROM entregas
              ORDER BY entregas.fecha_entrega DESC
              LIMIT ${resultsPerPage}
              OFFSET ${offset}
              `;

    const pages = Math.ceil(Number(data[0]?.total) / resultsPerPage);
    return { data, pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchSocialAidsByRUT(
  rut: string,
  query: string,
  currentPage: number,
) {
  const resultsPerPage = 6;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const data = await sql<SocialAid[]>`
      SELECT entregas.folio, entregas.fecha_entrega, entregas.estado_documentos, usuarios.nombre as nombre_usuario,
      COUNT (*) OVER() AS total 
      FROM entregas
      LEFT JOIN usuarios ON entregas.id_usuario = usuarios.id
      WHERE 
        entregas.rut = ${rut} AND
        entregas.folio ILIKE ${`%${query}%`}
      ORDER BY entregas.fecha_entrega DESC
      LIMIT ${resultsPerPage}
      OFFSET ${offset}
    `;

    const pages = Math.ceil(Number(data[0]?.total) / resultsPerPage);
    return { data, pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

// Returns Entregas[] de length = 1
export async function fetchSocialAidsGeneralInfoByFolio(folio: string) {
  try {
    const data = await sql<SocialAidTableRowByFolio[]>`
            SELECT entregas.folio, entregas.fecha_entrega, entregas.observacion, entregas.estado_documentos, usuarios.nombre as nombre_usuario
              FROM entregas
              LEFT JOIN usuarios ON entregas.id_usuario = usuarios.id
              WHERE entregas.folio = ${folio}
            `;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de las entregas: ", error);
    return { data: [], pages: 0 };
  }
}

// Returns Entrega[] de length = los que hayan
export async function fetchSocialAidsInfoByFolio(folio: string) {
  try {
    const data = await sql<SocialAidByFolio[]>`
            SELECT entrega.id_campaña, entrega.detalle, campañas.tipo_dato, campañas.nombre as nombre_campaña
              FROM entrega
              LEFT JOIN campañas ON entrega.id_campaña = campañas.id
              WHERE entrega.folio = ${folio}
            `;
    return { data };
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
) {
  const resultsPerPage = 6;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const data = await sql<SocialAid[]>`
              SELECT entregas.folio, entregas.fecha_entrega, rsh.nombres, rsh.apellidos, rsh.rut,
              COUNT (*) OVER() AS total 
              FROM entregas 
              JOIN entrega ON entrega.folio = entregas.folio
              JOIN rsh ON rsh.rut = entregas.rut
              WHERE 
                entrega.id_campaña = ${id} 
                AND (
                  rsh.nombres ILIKE ${`%${query}%`} OR
                  rsh.apellidos ILIKE ${`%${query}%`} OR
                  rsh.rut ILIKE ${`%${query}%`} OR
                  entregas.folio ILIKE ${`%${query}%`}
                )
              ORDER BY entregas.fecha_entrega DESC
              LIMIT ${resultsPerPage}
              OFFSET ${offset}
              `;
    const pages = Math.ceil(Number(data[0]?.total) / resultsPerPage);
    return { data, pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchFilesByFolio(folio: string) {
  try {
    const data = await sql<SocialFiles[]>`
              SELECT documentos.fecha_guardado, documentos.nombre_documento, documentos.tipo, documentos.id
              FROM documentos
              WHERE documentos.folio = ${folio}
              `;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [] };
  }
}
