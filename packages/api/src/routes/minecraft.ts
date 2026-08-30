import { createRoute } from "@hono/zod-openapi";
import { gameSchema, inventorySchema } from "@workspace/contracts/minecraft";
import { z } from "@hono/zod-openapi";

export const getGameRoute = createRoute({
  method: "get",
  path: "/games/{id}",
  request: {
    params: z.object({
      gameId: z.number().positive().optional().openapi({
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
  path: "/games/{id}/inventory",
  request: {
    params: z.object({
      gameId: z.number().positive().openapi({
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
