import { createRoute } from "@hono/zod-openapi";
import {
  getTestUsersParamsSchema,
  testUserSchema,
} from "@workspace/contracts/users";

export const getTestUsersRoute = createRoute({
  method: "get",
  path: "/testUsers",
  request: {
    query: getTestUsersParamsSchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: testUserSchema.array(),
        },
      },
      description: "Retrieve the test users",
    },
  },
});
