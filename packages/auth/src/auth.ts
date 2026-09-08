import { betterAuth } from "better-auth";
import { anonymous } from "better-auth/plugins";
import { Database } from "@workspace/db";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import * as schema from "@workspace/db/schema";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

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
  session: {
    expiresIn: 60 * 60 * 24 * 365, // expires after 1 year of inactivity
    updateAge: 60 * 60 * 24 * 7, // extend it after 7 days of activity
  },
  baseURL: process.env.HONO_API_URL as string,
  trustedOrigins: [process.env.REACT_APP_BASE_URL as string],
  plugins: [
    anonymous({
      generateName: () => {
        const random_name = uniqueNamesGenerator({
          dictionaries: [adjectives, colors, animals],
        });
        return "anon:" + random_name;
      },
    }),
  ],
});

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};
