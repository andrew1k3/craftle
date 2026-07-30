import { serve } from "@hono/node-server";
import app from "./index";

serve({
  fetch: app.fetch,
  port: 3030,
});

console.log("API running on http://localhost:3030/api");
