import postgres from "postgres";
import { Campaña } from "./definitios";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchCampañasFiltradas(query: string, paginaActual: number) {
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
        const totalPaginas = Math.ceil(Number(data[0]?.cantidad_total) / resultadosPorPagina);
        return { data, totalPaginas };
    } catch (error) {
        console.error("Error al obtener datos de la tabla de campañas:", error);
        return { data: [], totalPaginas: 0 };
    }
}