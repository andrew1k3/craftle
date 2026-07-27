import { createRoute, type RouteConfig } from "@hono/zod-openapi";
import { getUsersParamsSchema, userSchema } from "../models/users";

export const getUsersRoute = createRoute({
  method: "get",
  path: "/users",
  request: {
    query: getUsersParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: userSchema.array(),
        },
      },
      description: "Retrieve the users",
    },
  },
});
