import { betterAuth } from "better-auth";
import { Database } from "@workspace/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

export const auth = betterAuth({
  database: drizzleAdapter(Database.getInstance(), {
    provider: "pg",
  }),
});
