import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";

export function createAuthClient(baseURL: string) {
  return createBetterAuthClient({
    baseURL,
    plugins: [anonymousClient()],
  });
}

export type AppAuthClient = ReturnType<typeof createAuthClient>;
