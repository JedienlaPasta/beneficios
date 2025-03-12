import postgres from "postgres";
import { RSH } from "../definitions";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

export async function fetchRshById(id: string) {
  try {
    const data = await sql<RSH[]>`SELECT * FROM rsh WHERE id = ${id}`;
    return { data };
  } catch (error) {
    console.error("Error al obtener datos de la tabla de campañas:", error);
    return { data: [] };
  }
}
