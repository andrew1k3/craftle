import { createRoute } from "@hono/zod-openapi";
import { gameSchema, inventorySchema } from "@workspace/contracts/minecraft";
import { z } from "@hono/zod-openapi";
import { authMiddleware } from "../middleware";

export const getLatestGameIdRoute = createRoute({
  method: "get",
  path: "/games/game/id",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.number().openapi({
            description: "The ID of the latest game",
            example: 1,
          }),
        },
      },
      description: "Retrieve the ID of the latest game",
    },
  },
});

export const generateGameRoute = createRoute({
  method: "post",
  path: "/games/generate",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: gameSchema,
        },
      },
      description: "Generate a new game",
    },
  },
});

export const getGameRoute = createRoute({
  method: "get",
  middleware: authMiddleware,
  path: "/games/game",
  request: {
    query: z.object({
      gameId: z.coerce.number().positive().optional().openapi({
        description: "The ID of the game to retrieve",
        example: 1,
      }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: gameSchema,
        },
      },
      description: "Retrieve the game",
    },
  },
});

export const getInventoryRoute = createRoute({
  method: "get",
  path: "/games/inventory",
  request: {
    query: z.object({
      gameId: z.coerce.number().positive().optional().openapi({
        description: "The ID of the game to retrieve the inventory for",
        example: 1,
      }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: inventorySchema,
        },
      },
      description: "Retrieve the inventory",
    },
  },
});

export const deleteGameRoute = createRoute({
  method: "delete",
  path: "/games/game",
  request: {
    query: z.object({
      gameId: z.coerce.number().positive().optional().openapi({
        description: "The ID of the game to delete",
        example: 1,
      }),
    }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
      description: "Delete the game",
    },
  },
});
