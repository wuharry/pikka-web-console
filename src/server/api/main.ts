// src/server/api/main.ts
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { corsMiddleware } from "../services/cors-service";
import { logService } from "../services/log-service";

const app = new Hono();

// 中間件
app.use('*', corsMiddleware);

// 基本路由
app.get("/", (c) => c.text("Pikka Web Console Server"));

// Health Check
app.get("/health", (c) => c.json({ 
  status: "ok", 
  timestamp: new Date().toISOString() 
}));

// Log 相關 API 路由
app.route('/api/logs', logService);

// 啟動服務器
const port = 8174;
console.log(`🚀 Pikka Web Console Server is running on port ${port}`);
console.log(`📊 Health Check: http://localhost:${port}/health`);
console.log(`📝 Log API: http://localhost:${port}/api/logs`);

serve({
  fetch: app.fetch,
  port: port,
});

export default app;
