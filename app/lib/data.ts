import postgres from "postgres";
import { Campaña, EntregaDetalleCampaña } from "./definitions";

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

// Campañas =======================================================================================
// Datos tabla campañas
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

export async function fetchCampaignById(id: string) {
  try {
    const data = await sql<Campaña[]>`SELECT * FROM campañas WHERE id = ${id} `;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [] };
  }
}

// Entregas tabla detalle campaña
export async function fetchEntregasCampaña(id: string, paginaActual: number) {
  const resultadosPorPagina = 6;
  const offset = (paginaActual - 1) * resultadosPorPagina;
  try {
    const data = await sql<EntregaDetalleCampaña[]>`
            SELECT entregas.folio, entregas.beneficio, entregas.fecha, rsh.nombre, rsh.apellidos, rsh.rut,
            COUNT (*) OVER() AS cantidad_total 
            FROM entregas 
            JOIN rsh ON rsh.id = entregas.id_rsh
            WHERE entregas.id_campaña = ${id}
            ORDER BY entregas.fecha DESC
            LIMIT ${resultadosPorPagina}
            OFFSET ${offset}
            `;
    const paginas = Math.ceil(
      Number(data[0]?.cantidad_total) / resultadosPorPagina,
    );
    return { data, paginas };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de entregas:", error);
    return { data: [], paginas: 0 };
  }
}
