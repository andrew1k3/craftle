import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { getUsersRoute } from "./routes/users";
import { getUsers } from "./handlers/users";
import { getUsersParams, User } from "@workspace/contracts/users";
import { Database } from "@workspace/db";
import { Hono } from "hono";
import "dotenv/config";

export const BASE_PATH = "/api";

const app: Hono = new Hono();
const api: OpenAPIHono = new OpenAPIHono();
Database.getInstance(process.env.DATABASE_URL);

api.doc("/", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Craftle API",
  },
});

api.get("/health", (c) => {
  return c.json({ status: "ok" }, 200);
});

api.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.json(
    {
      message: "Internal server error",
    },
    500,
  );
});

//users
api.openapi(getUsersRoute, async (c) => {
  const usersParams: getUsersParams = c.req.valid("query");
  const users: User[] = await getUsers(usersParams);
  return c.json(users, 200);
});

app.route(BASE_PATH, api);
export default app;
