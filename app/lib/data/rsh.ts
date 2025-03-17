import postgres from "postgres";
import { RSH, RSHInfo } from "../definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchRSHById(id: string) {
  try {
    const data = await sql<RSH[]>`SELECT * FROM rsh WHERE rut = ${id}`;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [] };
  }
}

// Optimizar busquedas
export async function fetchRSH(
  query: string,
  currentPage: number,
  itemsPerPage?: number,
) {
  const resultsPerPage = itemsPerPage || 6;
  const offset = (currentPage - 1) * resultsPerPage || 0;
  try {
    const data = await sql<RSH[]>`
    SELECT rsh.rut, rsh.dv, rsh.nombres, rsh.apellidos, rsh.direccion, rsh.tramo,
    (SELECT MAX(entregas.fecha_entrega) FROM entregas WHERE entregas.rut = rsh.rut) AS ultima_entrega,
    COUNT (*) OVER() AS total
    FROM rsh
      WHERE concat(rsh.rut, ' ', rsh.nombres, ' ', rsh.apellidos, ' ', rsh.direccion) ILIKE ${`%${query}%`}
      ORDER BY rsh.nombres ASC
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

export async function fetchRSHInfo() {
  try {
    const data = await sql<RSHInfo[]>`
      SELECT rsh_info.ultima_actualizacion, rsh_count.total_registros
      FROM rsh_info
      CROSS JOIN (
        SELECT COUNT(*) AS total_registros
        FROM rsh
      ) AS rsh_count
      LIMIT 1
      `;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [] };
  }
}
