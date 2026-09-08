import { createRoute } from "@hono/zod-openapi";
import {
  getTestUsersParamsSchema,
  testUserSchema,
} from "@workspace/contracts/users";
import { authMiddleware } from "../middleware";

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

export const getAuthedTestUserRoute = createRoute({
  method: "get",
  path: "/getAuthedTestUser",
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
  middleware: authMiddleware,
});
