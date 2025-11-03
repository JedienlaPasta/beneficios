import sql from "mssql";

// Create a connection pool that persists between requests
let pool: sql.ConnectionPool | null = null;
// Flag to prevent multiple simultaneous connection attempts if the pool is being initialized
let connectionAttemptInProgress: boolean = false;

export async function connectToDB(): Promise<sql.ConnectionPool | null> {
  // If a connection attempt is already in progress, wait for it to complete
  if (connectionAttemptInProgress) {
    while (connectionAttemptInProgress) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    // After waiting, check if a pool is now connected
    if (pool && pool.connected) {
      return pool;
    }
    // If after waiting, the pool is still not connected, proceed to attempt a new connection below.
  }

  // Set flag to indicate a connection attempt is starting
  connectionAttemptInProgress = true;

  try {
    // If we already have a connection pool, return it
    if (pool && pool.connected) {
      connectionAttemptInProgress = false; // Clear flag
      return pool;
    }

    // If the pool exists but is disconnected, try to reconnect
    if (pool) {
      try {
        console.warn("Attempting to reconnect to existing pool...");
        await pool.connect();
        console.log("Successfully reconnected to existing pool.");
        connectionAttemptInProgress = false; // Clear flag
        return pool;
      } catch (reconnectError) {
        console.warn(
          "Failed to reconnect to existing pool, creating a new one:",
          reconnectError,
        );
        // Explicitly nullify the old pool so a new one is created
        pool = null;
      }
    }

    // If no active pool, or reconnection failed, create a new connection pool
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
      connectionTimeout: 15000, // Timeout for the initial connection itself
      requestTimeout: 30000, // Timeout for individual requests made on the pool
    };

    console.log("Creating new database connection pool...");
    const newPool = new sql.ConnectionPool(config);
    pool = await newPool.connect(); // Attempt to connect to the DB
    console.log("Database connection pool established.");

    // Error listener for the pool to handle runtime connection issues
    pool.on("error", (err) => {
      console.error("SQL Pool Error (Runtime):", err);
      // Reset the pool to null and attempt to close it to allow a fresh connection next time
      if (pool && pool.connected) {
        pool
          .close()
          .catch((e) => console.error("Error closing errored pool:", e));
      }
      pool = null;
    });

    connectionAttemptInProgress = false; // Clear flag
    return pool;
  } catch (error) {
    console.error("Database connection error (Initial/New Pool):", error);
    connectionAttemptInProgress = false; // Clear flag
    return null;
  }
}

export async function closePool() {
  if (pool) {
    try {
      await pool.close();
      console.log("Database connection pool closed.");
    } catch (error) {
      console.error("Error closing database pool:", error);
    } finally {
      pool = null;
    }
  }
}
