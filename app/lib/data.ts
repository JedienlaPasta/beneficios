import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function fetchCampañas() {
    try {
        const data = await sql<
    }
}