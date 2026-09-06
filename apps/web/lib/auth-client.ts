import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

export function createAuthClient(baseURL: string | undefined) {
  if (!baseURL) {
    throw new Error("baseURL is required to create auth client");
  }
  return createBetterAuthClient({
    baseURL,
    plugins: [anonymousClient()],
  });
}

export type AppAuthClient = ReturnType<typeof createAuthClient>;
