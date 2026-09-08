import { hc } from "hono/client";
import { AppType, BASE_PATH } from "@workspace/api";

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error(
    "API client didn't load. Couldn't read NEXT_PUBLIC_API_BASE_URL",
  );
}

const apiClient = hc<AppType>(
  `${process.env.NEXT_PUBLIC_API_BASE_URL}${BASE_PATH}`,
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

export default apiClient;
