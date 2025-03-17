import postgres from "postgres";
import { Campaign } from "../definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchCampaignById(id: string) {
  try {
    const data = await sql<Campaign[]>`SELECT * FROM campañas WHERE id = ${id}`;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [] };
  }
}

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
              OFFSET ${offset}`;
    const pages = Math.ceil(Number(data[0]?.total) / resultsPerPage);
    return { data, pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [], pages: 0 };
  }
}

export async function fetchActiveCampaigns() {
  try {
    const data = await sql<Campaign[]>`
              SELECT * FROM campañas WHERE fecha_termino > NOW()
              `;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [] };
  }
}
