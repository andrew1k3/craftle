import { OpenAPIHono, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { getTestUsersRoute } from "./routes/users";
import { getTestUsers } from "./handlers/users";
import { getTestUsersParams, TestUser } from "@workspace/contracts/users";
import { Database } from "@workspace/db";
import { Hono } from "hono";
import { auth, AuthType } from "@workspace/auth";
import { cors } from "hono/cors";
import {
  getGameRoute,
  getInventoryRoute,
  generateGameRoute,
  deleteGameRoute,
  getLatestGameIdRoute,
} from "./routes/minecraft";
import {
  generateGame,
  getInventory,
  getGame,
  deleteGame,
  getLatestGameId,
} from "./handlers/minecraft";
import { GameData, InventoryData } from "@workspace/contracts/minecraft";
import { createMiddleware } from "hono/factory";
import { error } from "console";
import { authMiddleware } from "./middleware";

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

//middleware
api.use(
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["Content-Type"],
    allowMethods: ["POST", "GET", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    credentials: true,
  }),
);

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
api.on(["GET", "POST"], "/auth/*", (c) => auth.handler(c.req.raw));

//testUsers
api.openapi(getTestUsersRoute, async (c) => {
  const usersParams: getTestUsersParams = c.req.valid("query");
  const users: TestUser[] = await getTestUsers(usersParams);
  return c.json(users, 200);
});

//minecraft
api.openapi(getLatestGameIdRoute, async (c) => {
  const gameId: number = await getLatestGameId();
  return c.json(gameId, 200);
});

api.openapi(generateGameRoute, async (c) => {
  const game: GameData = await generateGame();
  return c.json(game, 200);
});

api.openapi(getGameRoute, async (c) => {
  const getGameParams: z.infer<typeof getGameRoute.request.query> =
    c.req.valid("query");
  const game: GameData = await getGame(getGameParams);
  return c.json(game, 200);
});

api.openapi(getInventoryRoute, async (c) => {
  const getInventoryParams: z.infer<typeof getInventoryRoute.request.query> =
    c.req.valid("query");
  const inventory: InventoryData = await getInventory(getInventoryParams);
  return c.json(inventory, 200);
});

api.openapi(deleteGameRoute, async (c) => {
  const deleteGameParams: z.infer<typeof deleteGameRoute.request.query> =
    c.req.valid("query");
  const result = await deleteGame(deleteGameParams);
  return c.json(result, 200);
});

app.route(BASE_PATH, api);

init();

export default app;
