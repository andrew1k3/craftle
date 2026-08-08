"use client";

import { useContext } from "react";
import {
  AuthClient,
  BetterAuthClientOptions,
  ErrorContext,
  RequestContext,
  SuccessContext,
} from "better-auth/client";
import { AuthContext } from "@/components/auth-provider";

export default function useAuth() {
  const authClient: AuthClient<BetterAuthClientOptions> =
    useContext(AuthContext)!;

  const handleSignUp = async () => {
    const { data, error } = await authClient.signUp.email(
      {
        email: "test_email",
        name: "test_name",
        password: "test_password",
      },
      {
        onRequest: (ctx: RequestContext) => {
          console.log("Request: ", ctx);
        },
        onSuccess: (ctx: SuccessContext) => {
          console.log("Success: ", ctx);
        },
        onError: (ctx: ErrorContext) => {
          console.log("Error: ", ctx);
        },
      },
    );

    console.log(data);
    console.log(error);
  };

  return { authClient, handleSignUp };
}
