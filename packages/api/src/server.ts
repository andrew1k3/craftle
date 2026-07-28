import { serve } from "@hono/node-server";
import app from "./index";

serve({
  fetch: app.fetch,
});

console.log("API running on http://localhost/api/");
