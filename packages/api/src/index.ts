import { OpenAPIHono } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { getTestUsersRoute } from "./routes/users";
import { getTestUsers } from "./handlers/users";
import { getTestUsersParams, TestUser } from "@workspace/contracts/users";
import { Database } from "@workspace/db";
import { Hono } from "hono";
import { auth, AuthType } from "@workspace/auth";

export const BASE_PATH = "/api";

function init() {
  Database.getInstance();
}

const app: Hono<{ Variables: AuthType }> = new Hono<{ Variables: AuthType }>({
  strict: false,
});
const api: OpenAPIHono<{ Variables: AuthType }> = new OpenAPIHono<{
  Variables: AuthType;
}>();

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

//auth
app.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));


//testUsers
api.openapi(getTestUsersRoute, async (c) => {
  const usersParams: getTestUsersParams = c.req.valid("query");
  const users: TestUser[] = await getTestUsers(usersParams);
  return c.json(users, 200);
});

app.route(BASE_PATH, api);

init();

export default app;
