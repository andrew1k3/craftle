"use client";

import { createContext, useState, type PropsWithChildren } from "react";

import { createAuthClient, type AppAuthClient } from "@/lib/auth-client";

export const AuthContext = createContext<AppAuthClient | null>(null);

type AuthProviderProps = PropsWithChildren<{
  baseURL: string;
}>;

export function AuthProvider({ baseURL, children }: AuthProviderProps) {
  const [authClient] = useState(() => createAuthClient(baseURL));

  return (
    <AuthContext.Provider value={authClient}>{children}</AuthContext.Provider>
  );
}
