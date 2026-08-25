import { z } from "@hono/zod-openapi";
import { Shape } from "minecraft-data";

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
});

export const recipeSchema = z.object({
  id: z
    .string()
    .min(1)
    .openapi({
      examples: ["shapeless_1_2_3__4", "shaped_123_456_789__10"],
    }),
  result: itemSchema,
});

export const shapelessRecipeSchema = recipeSchema.extend({
  ingredients: z.array(itemSchema).min(1).openapi({
    description: "The ingredients for the shapeless recipe",
  }),
});

export const shapedRecipeSchema = recipeSchema.extend({
  inShape: z.custom<Shape>().openapi({
    description: "The shape of the recipe",
  }),
});

export type ItemData = z.infer<typeof itemSchema>;
export type RecipeData = z.infer<typeof recipeSchema>;
export type ShapelessRecipeData = z.infer<typeof shapelessRecipeSchema>;
export type ShapedRecipeData = z.infer<typeof shapedRecipeSchema>;
