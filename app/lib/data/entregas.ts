import postgres from "postgres";
import { SocialAid } from "../definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchSocialAid(
  id: string,
  query: string,
  currentPage: number,
) {
  const resultsPerPage = 6;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const data = await sql<SocialAid[]>`
              SELECT entregas.folio, entregas.fecha_entrega, rsh.nombre, rsh.apellidos, rsh.rut,
              COUNT (*) OVER() AS total 
              FROM entregas 
              JOIN entrega ON entrega.folio = entregas.folio
              JOIN rsh ON rsh.rut = entregas.rut
              WHERE 
                entrega.id_campaña = ${id} 
                AND (
                  rsh.nombre ILIKE ${`%${query}%`} OR
                  rsh.apellidos ILIKE ${`%${query}%`} OR
                  rsh.rut ILIKE ${`%${query}%`} OR
                  entregas.folio ILIKE ${`%${query}%`}
                )
              ORDER BY entregas.fecha_entrega DESC
              LIMIT ${resultsPerPage}
              OFFSET ${offset}`;
    const pages = Math.ceil(Number(data[0]?.total) / resultsPerPage);
    return { data, pages };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], pages: 0 };
  }
}
