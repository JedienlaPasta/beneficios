import postgres from "postgres";
import { Activity, Campaign, SocialAid } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Inicio
export async function fetchUserActivity(
  id: string,
  query: string,
  currentPage: number,
) {
  const resultsPerPage = 6;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const data = await sql<Activity[]>`
            SELECT usuarios.nombre, auditoria.accion, auditoria.dato, auditoria.fecha, auditoria.id_campaña, auditoria.id_entrega, auditoria.id_rsh,
            COUNT (*) OVER() AS total
            FROM auditoria
            JOIN usuarios ON auditoria.id_usuario = usuarios.id
            WHERE
                usuarios.nombre ILIKE ${`%${query}%`}
            ORDER BY auditoria.fecha DESC
            LIMIT ${resultsPerPage}
            OFFSET ${offset}
            `;

    const pages = Math.ceil(Number(data[0]?.total) / resultsPerPage);
    return { data, pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de auditoria:", error);
    return { data: [], pages: 0 };
  }
}

// Campañas =======================================================================================
// Datos tabla campañas
export async function fetchCampaigns(query: string, currentPage: number) {
  const resultsPerPage = 6;
  const offset = (currentPage - 1) * resultsPerPage || 0;
  try {
    const data = await sql<Campaign[]>`
            SELECT *, COUNT (*) OVER() AS total
            FROM campañas 
            WHERE 
                campañas.nombre ILIKE ${`%${query}%`}
            ORDER BY campañas.fecha_inicio DESC
            LIMIT ${resultsPerPage}
            OFFSET ${offset}
            `;
    const pages = Math.ceil(Number(data[0]?.total) / resultsPerPage);
    return { data, pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchCampaignById(id: string) {
  try {
    const data = await sql<
      Campaign[]
    >`SELECT * FROM campañas WHERE id = ${id} `;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [] };
  }
}

// Entregas tabla detalle campaña
export async function fetchSocialAid(
  id: string,
  query: string,
  currentPage: number,
) {
  const resultsPerPage = 6;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const data = await sql<SocialAid[]>`
            SELECT entregas.folio, entregas.beneficio, entregas.fecha, rsh.nombre, rsh.apellidos, rsh.rut,
            COUNT (*) OVER() AS total 
            FROM entregas 
            JOIN rsh ON rsh.id = entregas.id_rsh
            WHERE 
              entregas.id_campaña = ${id} 
              AND (
                rsh.nombre ILIKE ${`%${query}%`} OR
                rsh.apellidos ILIKE ${`%${query}%`} OR
                rsh.rut ILIKE ${`%${query}%`}
              )
            ORDER BY entregas.fecha DESC
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
