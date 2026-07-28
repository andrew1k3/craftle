import { z } from "@hono/zod-openapi";

export const getUsersParamsSchema = z.object({
  limit: z.number().int().positive().optional().openapi({
    description: "The maximum number of users to return",
    example: 10,
  }),
  offset: z.number().int().nonnegative().optional().openapi({
    description:
      "The number of users to skip before starting to collect the result set",
    example: 0,
  }),
});

export const userSchema = z
  .object({
    id: z.number().int().positive().openapi({
      example: 1,
    }),
    name: z.string().min(1).max(255).openapi({
      example: "John Doe",
    }),
    role: z.string().min(1).max(255).openapi({
      example: "user",
    }),
    email: z.string().min(1).max(255).openapi({
      example: "john@example.com",
    }),
  })
  .openapi({
    title: "User",
    description: "A user object",
  });

export type User = z.infer<typeof userSchema>;
export type getUsersParams = z.infer<typeof getUsersParamsSchema>;
