import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { getUsersRoute } from "./routes/users";
import { getUsers } from "./handlers/users";
import { getUsersParams } from "./models/users";
import { Database, Db } from "@workspace/db";

const app: OpenAPIHono = new OpenAPIHono();
// Initialize the database connection
const db: Db = Database.getInstance();

// Users
app.openapi(getUsersRoute, async (c) => {
  c.req.valid("query");
  const usersParams: getUsersParams = c.req.queries();
  const users = await getUsers(usersParams);
  return c.json(users, 200);
});

// app.openapi(route, )

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
