"use client";

import { BetterAuthClientOptions, AuthClient } from "better-auth/client";
import { createAuthClient } from "@/lib/auth-client";
import { createContext } from "react";

export const AuthContext =
  createContext<AuthClient<BetterAuthClientOptions> | null>(null);

function AuthProvider({
  baseURL,
  children,
  ...props
}: React.PropsWithChildren<BetterAuthClientOptions>) {
  const authClient = createAuthClient(baseURL!);
  return (
    <AuthContext.Provider value={authClient} {...props}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthProvider };
