import { createAuthClient as _createAuthClient } from "better-auth/client";

export function createAuthClient(baseUrl: string) {
  return _createAuthClient({
    baseURL: baseUrl,
  });
}
