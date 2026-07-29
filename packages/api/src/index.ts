import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { getUsersRoute } from "./routes/users";
import { getUsers } from "./handlers/users";
import { getUsersParams, getUsersParamsSchema } from "./models/users";
import { Database } from "@workspace/db";
import "dotenv/config";

const app: OpenAPIHono = new OpenAPIHono();
Database.getInstance(process.env.DATABASE_URL); // Initialize the database connection

// -- Users --
// Get all users
app.openapi(getUsersRoute, async (c) => {
  const usersParams: getUsersParams = c.req.valid("query");
  if (!getUsersParamsSchema.safeParse(usersParams).success) {
    throw new HTTPException(400, {
      message: "Invalid query parameters",
    });
  }

  const users = await getUsers(usersParams);
  return c.json(users, 200);
});

app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "My API",
  },
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  console.error(err);

  return c.json(
    {
      message: "Internal server error",
    },
    500,
  );
});

export default app;
