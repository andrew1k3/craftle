import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export type Db = ReturnType<typeof drizzle>;

const MAX_CONNECTIONS = 10;
const IDLE_TIMEOUT_MS = 30000; // 30 seconds
const CONNECTION_TIMEOUT_MS = 2000; // 2 seconds

export class Database {
  private static instance: Db;

  private constructor() {}

  public static getInstance(): Db {
    if (Database.instance) {
      return Database.instance;
    }

    const connectionString = process.env.DATABASE_URL;
    console.log("DATABASE_URL: ", connectionString);

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set.");
    }

    const pool: Pool = new Pool({
      connectionString: connectionString,
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
