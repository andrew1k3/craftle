import { hc } from "hono/client";
import { AppType } from "@workspace/api";

const API_PATH = "/api";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error(
    "API client didn't load. Couldn't read NEXT_PUBLIC_API_BASE_URL",
  );
}

const apiClient = hc<AppType>(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}${API_PATH}`,
  {
    init: {
      credentials: "include",
    },
  },
);

export const healthCheck = async () => {
  const response = await apiClient.health.$get();

  if (!response.ok) {
    throw new Error("Health check failed");
  }

  return response.json();
};

export const getAuthedTestUsers = async (params: {
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.getAuthedTestUser.$get({ query: params });

  if (!response.ok) {
    throw new Error("Failed to fetch authed test users");
  }

  return response.json();
};

export default apiClient;
