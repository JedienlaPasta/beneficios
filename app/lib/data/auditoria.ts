import postgres from "postgres";
import { Activity } from "../definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchUserActivity(query: string, currentPage: number) {
  const resultsPerPage = 6;
  const offset = (currentPage - 1) * resultsPerPage;
  try {
    const data = await sql<Activity[]>`
              SELECT usuarios.nombre, auditoria.accion, auditoria.dato, auditoria.fecha, auditoria.id_mod,
              COUNT (*) OVER() AS total
              FROM auditoria
              JOIN usuarios ON auditoria.nombre_usuario = usuarios.nombre
              WHERE
                  usuarios.nombre ILIKE ${`%${query}%`} OR
                  auditoria.dato ILIKE ${`%${query}%`}
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
