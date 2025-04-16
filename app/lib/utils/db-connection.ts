import sql from "mssql";

// Create a connection pool that persists between requests
let pool: sql.ConnectionPool | null = null;

export async function connectToDB() {
  try {
    // If we already have a connection pool, return it
    if (pool && pool.connected) {
      return pool;
    }

    // If the pool exists but is disconnected, try to reconnect
    if (pool) {
      try {
        await pool.connect();
        return pool;
      } catch (reconnectError) {
        console.log(
          "Failed to reconnect to existing pool, creating new one",
          reconnectError,
        );
        // Continue to create a new pool
      }
    }

    // Create a new connection pool
    const config: sql.config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_HOST || "localhost",
      database: process.env.DB_NAME,
      options: {
        encrypt: true, // For Azure use true
        trustServerCertificate: true, // For local dev / self-signed certs
        cryptoCredentialsDetails: {
          minVersion: "TLSv1.2",
        },
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
      connectionTimeout: 15000,
      requestTimeout: 30000, // Increased from 15000 to 30000 to match your query timeout
    };

    pool = await new sql.ConnectionPool(config).connect();

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("SQL Pool Error:", err);
      pool = null; // Reset the pool so a new one will be created next time
    });

    return pool;
  } catch (error) {
    console.error("Database connection error:", error);
    throw error;
  }
}

// Optional: Add a function to explicitly close the pool when needed
export async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
  }
}
