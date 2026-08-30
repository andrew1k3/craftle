import { z } from "@hono/zod-openapi";

export const itemSchema = z.object({
  id: z.number().int().positive().openapi({ example: 1 }),
  name: z.string().min(1).max(255).openapi({ example: "stone" }),
  displayName: z.string().min(1).max(255).openapi({
    example: "Stone",
  }),
  stackSize: z
    .number()
    .int()
    .gte(1)
    .lte(64)
    .refine((size) => Math.log2(size) % 1 === 0, {
      message: "stackSize must be a power of 2 between 1 and 64",
    })
    .openapi({
      example: 64,
    }),
  image: z
    .string()
    .min(1)
    .max(255)
    .refine((image) => image.startsWith("data:image/png;base64,"))
    .openapi({
      example:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVUlEQVR42mNgGAXYwSOB/ySJo4PMDRb/STYcGeg58/zHZzheC9BtACl2KVL5j2w4PgvgBqyB2kJYAw7biNaE7ncMjUheArkqH8k7JLmIZO+QpWFoAgAY9DgM7ldwswAAAABJRU5ErkJggg==",
    }),
  count: z.number().int().optional().openapi({
    example: "4",
  }),
});

export type ItemData = z.infer<typeof itemSchema>;

export const recipeSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      examples: ["shapeless_1_2_3__4", "shaped_123_456_789__10"],
    }),
  result: itemSchema.optional().openapi({
    description:
      "The result of the recipe, can be null if the recipe is not craftable",
  }),
});

export const shapelessRecipeSchema = recipeSchema.extend({
  ingredients: z.array(itemSchema).min(1).openapi({
    description: "The ingredients for the shapeless recipe",
  }),
});

export const shapedRecipeSchema = recipeSchema.extend({
  shape: z
    .array(z.array(itemSchema.nullable()).min(1).max(3))
    .min(1)
    .max(3)
    .openapi({
      description: "The shape of the shaped recipe",
    }),
});

export type RecipeData = z.infer<typeof recipeSchema>;
export type ShapelessRecipeData = z.infer<typeof shapelessRecipeSchema>;
export type ShapedRecipeData = z.infer<typeof shapedRecipeSchema>;

export const inventorySchema = z.array(itemSchema).openapi({
  description: "The inventory of the game",
});

export const gameSchema = z.object({
  gameId: z.number().int().positive().openapi({
    example: 1,
  }),
  createdAt: z.iso.datetime().openapi({
    example: "2023-01-01T00:00:00.000Z",
  }),
  isActive: z.boolean().openapi({
    description: "Whether the game is active or not",
    example: true,
  }),
  expectedItem: itemSchema.openapi({
    description: "The expected item for the game",
  }),
  inventory: inventorySchema,
});

export type GameData = z.infer<typeof gameSchema>;
export type InventoryData = z.infer<typeof inventorySchema>;
