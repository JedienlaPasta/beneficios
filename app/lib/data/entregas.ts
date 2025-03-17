import postgres from "postgres";
import { SocialAid } from "../definitions";

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
              SELECT entregas.folio, entregas.fecha_entrega, entregas.observacion, entregas.id_usuario, entrega.detalle, entrega.id_campaña, campañas.nombre as nombre_campaña, usuarios.nombre as nombre_usuario,
              COUNT (*) OVER() AS total
              FROM entregas
              LEFT JOIN entrega ON entregas.folio = entrega.folio
              LEFT JOIN campañas ON entrega.id_campaña = campañas.id
              LEFT JOIN usuarios ON entregas.id_usuario = usuarios.id
              WHERE entregas.rut = ${rut}
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
