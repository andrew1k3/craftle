import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@workspace/db/schema";
import "dotenv/config";

export type Db = NodePgDatabase<typeof schema>;

const MAX_CONNECTIONS = 2;
const IDLE_TIMEOUT_MS = 30_000; // 30 seconds
const CONNECTION_TIMEOUT_MS = 10_000; // 10 seconds

export class Database {
  private static instance: Db;

  private constructor() {}

  public static getInstance(): Db {
    if (Database.instance) {
      return Database.instance;
    }

    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set.");
    }

    const pool: Pool = new Pool({
      connectionString: connectionString,
      max: MAX_CONNECTIONS,
      idleTimeoutMillis: IDLE_TIMEOUT_MS,
      connectionTimeoutMillis: CONNECTION_TIMEOUT_MS,
    });

    pool.on("error", (err) => {
      console.error("idle client error", err);
    });

    Database.instance = drizzle({
      client: pool,
      schema,
    });
    return Database.instance;
  }
}
