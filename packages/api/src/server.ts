import "dotenv/config";
import { serve } from "@hono/node-server";
import app from "./index";

serve({
  fetch: app.fetch,
  port: parseInt(process.env.PORT!) || 3030,
});

console.log(
  "API running on http://localhost:" + (parseInt(process.env.PORT!) || 3030),
);
