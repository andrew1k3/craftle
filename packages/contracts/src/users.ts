import { z } from "@hono/zod-openapi";

export const getTestUsersParamsSchema = z.object({
  limit: z.coerce.number().int().positive().optional().openapi({
    description: "The maximum number of test users to return",
    example: 10,
  }),
  offset: z.coerce.number().int().nonnegative().optional().openapi({
    description:
      "The number of test users to skip before starting to collect the result set",
    example: 0,
  }),
});

export const testUserSchema = z
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
    title: "Test User",
    description: "A test user object",
  });

export type TestUser = z.infer<typeof testUserSchema>;
export type getTestUsersParams = z.infer<typeof getTestUsersParamsSchema>;
