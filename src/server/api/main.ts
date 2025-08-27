// Src / server / api / main.ts;
import { Hono } from "hono";
import { serve } from "@hono/node-server";
// 需要webSocket進行通訊
import { upgradeWebSocket } from "hono/cloudflare-workers";

type ConsoleMsgType = "log" | "info" | "warn" | "error";

const app = new Hono();

app.get("/", (c) => c.text("Hono!"));
app.get("/api/log", (c) => c.json({ message: "Hello from Hono!" }));

const port = 8992;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
