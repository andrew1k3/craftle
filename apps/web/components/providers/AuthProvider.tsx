"use client";

import { createContext, useEffect, useState, type PropsWithChildren } from "react";

import { createAuthClient, type AppAuthClient } from "@/lib/auth-client";

export const AuthContext = createContext<AppAuthClient | null>(null);

type AuthProviderProps = PropsWithChildren<{
  baseURL: string;
}>;

export function AuthProvider({ baseURL, children }: AuthProviderProps) {
  const [authClient] = useState(() => createAuthClient(baseURL));
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.isPending && !session.data) {
      authClient.signIn.anonymous();
    }
  }, [authClient, session.isPending, session.data]);

  return (
    <AuthContext.Provider value={authClient}>{children}</AuthContext.Provider>
  );
}
