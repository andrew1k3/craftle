import { betterAuth } from "better-auth";
import { Database } from "@workspace/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@workspace/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(Database.getInstance(), {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  baseURL: process.env.HONO_API_URL as string,
  trustedOrigins: [process.env.REACT_APP_BASE_URL as string],
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
