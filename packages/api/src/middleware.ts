import { auth } from "@workspace/auth";
import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!session.user) {
    throw new Error("User not properly parsed");
  }

  c.set("user", session.user);

  if (!session.session) {
    throw new Error("Session not properly parsed");
  }

  c.set("session", session.session);

  await next();
});
