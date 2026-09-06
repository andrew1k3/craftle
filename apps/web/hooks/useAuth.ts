"use client";

import { useContext } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";

export default function useAuth() {
  const authClient = useContext(AuthContext);

  if (!authClient) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  const session = authClient.useSession();

  return {
    authClient,
    session,
  };
}
