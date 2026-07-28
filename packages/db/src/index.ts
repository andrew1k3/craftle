import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import "dotenv/config";

export type Db = ReturnType<typeof drizzle>;

const MAX_CONNECTIONS = 10;
const IDLE_TIMEOUT_MS = 30000; // 30 seconds
const CONNECTION_TIMEOUT_MS = 2000; // 2 seconds

export class Database {
  private static instance: Db;

  private constructor() {}

  public static getInstance(connectionString?: string): Db {
    if (Database.instance) {
      return Database.instance;
    }

    if (!connectionString && !process.env.DATABASE_URL) {
      console.log(connectionString, process.env.DATABASE_URL);
      if (!connectionString) {
        throw new Error(
          "Database connection string is not provided and DATABASE_URL environment variable is not set.",
        );
      }
      if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL environment variable is not set.");
      }
    }

    const pool: Pool = new Pool({
      connectionString: connectionString || process.env.DATABASE_URL,
      max: MAX_CONNECTIONS,
      idleTimeoutMillis: IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    });

    Database.instance = drizzle({
      client: pool,
    });
    return Database.instance;
  }
}
