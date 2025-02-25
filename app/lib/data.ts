import postgres from "postgres";
import { Campaña } from "./definitios";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchCampañas() {
    try {
        const data = await sql<Campaña[]>`SELECT * FROM campañas`;
        return data;
    } catch (error) {
        console.error(error);
    }
}