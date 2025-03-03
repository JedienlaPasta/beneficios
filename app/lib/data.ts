import postgres from "postgres";
import { Campaña } from "./definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

// Inicio
export async function fetchActividadesUsuario(
  id: string,
  query: string,
  paginaActual: number,
) {
  const resultadosPorPagina = 6;
  const offset = (paginaActual - 1) * resultadosPorPagina;
  try {
    const data = await sql`
            SELECT usuarios.nombre, auditoria.accion, auditoria.dato, auditoria.fecha, auditoria.id_campaña, auditoria.id_entrega, auditoria.id_rsh,
            COUNT (*) OVER() AS cantidad_total
            FROM auditoria
            JOIN usuarios ON auditoria.id_usuario = usuarios.id
            ORDER BY auditoria.fecha DESC
            LIMIT ${resultadosPorPagina}
            OFFSET ${offset}
            `;

    const paginas = Math.ceil(
      Number(data[0]?.cantidad_total) / resultadosPorPagina,
    );
    return { data, paginas };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de auditoria:", error);
    return { data: [], paginas: 0 };
  }
}

// Campañas
export async function fetchCampañasFiltradas(
  query: string,
  paginaActual: number,
) {
  const resultadosPorPagina = 6;
  const offset = (paginaActual - 1) * resultadosPorPagina;
  try {
    const data = await sql<Campaña[]>`
            SELECT *, COUNT (*) OVER() AS cantidad_total
            FROM campañas 
            WHERE 
                campañas.nombre ILIKE ${`%${query}%`}
            ORDER BY campañas.fecha_inicio DESC
            LIMIT ${resultadosPorPagina}
            OFFSET ${offset}
            `;
    const paginas = Math.ceil(
      Number(data[0]?.cantidad_total) / resultadosPorPagina,
    );
    return { data, paginas };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [], paginas: 0 };
  }
}
