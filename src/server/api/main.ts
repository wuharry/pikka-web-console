// Src / server / api / main.ts
import { Hono } from "hono";
import type { WSContext } from "hono/ws";
import { createNodeWebSocket } from "@hono/node-ws";
import { serve } from "@hono/node-server";
// import type { ChannelMessage, ConsolePayload, ErrorPayload } from "../types";

// type ConsoleMsgType = "log" | "info" | "warn" | "error";

const app = new Hono();

app.get("/", (c) => c.text("Hello, Hono!, with WebSocket!"));
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

// ✅ 正確理解：WebSocket 記住連接物件，加上 TypeScript 型別
const connections = new Set<WSContext>();
// connections 存的是：[ws1, ws2, ws3, ...]
// 每個 ws 都是一個獨立的 WebSocket 連接實例
// connections 是用來儲存所有 WebSocket 連接的容器！

app.get(
  "/monitor",
  upgradeWebSocket((_c) => ({
    onOpen: (event: Event, ws: WSContext) => {
      // 觸發時機：WebSocket 連接建立時
      // event 包含連接建立的相關資訊
      // ws 是 WebSocket 連接物件，可以用來發送和接收訊息
      console.log("WebSocket connection established");
      console.log("WebSocket connection opened:", event);
      connections.add(ws);
      console.log(`目前連接數: ${connections.size}`);
      console.log("WebSocket 實例:", ws);
      ws.send("Welcome to the WebSocket server!");
    },
    onClose: (event: CloseEvent, ws: WSContext) => {
      // event 包含連接關閉的相關資訊
      // 觸發時機：WebSocket 連接關閉時
      // 用途：清理資源、記錄日誌等
      console.log("WebSocket connection closed");
      console.log("WebSocket connection closed:", event);
      console.log("WebSocket 實例:", ws);

      // ✅ 從連接集合中移除已關閉的連接
      connections.delete(ws);
      console.log(`剩餘連接數: ${connections.size}`);
    },
    onError: (event: Event, ws: WSContext) => {
      // event 包含錯誤的相關資訊
      console.log("WebSocket connection error");
      console.error("WebSocket error occurred:", event);
      console.log("WebSocket 實例:", ws);

      // ✅ 錯誤時也應該移除連接
      connections.delete(ws);
    },
    onMessage: (event: MessageEvent, ws: WSContext) => {
      // event.data 包含接收到的訊息
      // producer 發送過來的訊息會在這邊處理
      console.log(`收到訊息: ${event.data}`);

      // 廣播訊息給所有連接的客戶端
      connections.forEach((client: WSContext) => {
        // ✅ 檢查連接狀態，只發送給開啟的連接
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(event.data);
        }
      });

      console.log("WebSocket message received:", event.data);
      console.log("WebSocket 實例:", ws);
    },
  }))
);

const port = 8992;

const server = serve({ fetch: app.fetch, port });
injectWebSocket(server);

console.log(`Server is running on http://localhost:${port}`);

export default app;
