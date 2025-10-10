// Src / server / api / main.ts
import { Hono } from "hono";
import type { WSContext } from "hono/ws";
import { createNodeWebSocket } from "@hono/node-ws";
import { serve } from "@hono/node-server";
import { pathToFileURL } from "url";

/**
 * 創建 Hono 應用及 WebSocket 配置（建構階段）
 *
 * 此函數負責：
 * 1. 創建 Hono 應用實例並註冊路由
 * 2. 配置 WebSocket 升級處理器
 * 3. 初始化連接追蹤容器
 *
 * 注意：此階段僅定義應用結構，不啟動任何網絡服務
 *
 * @returns {Object} 應用配置對象
 * @returns {Hono} returns.app - Hono 應用實例，包含所有路由定義
 * @returns {(server: Server) => void} returns.injectWebSocket - 將 WebSocket 升級邏輯綁定到 HTTP 服務器
 * @returns {Set<WSContext>} returns.connections - 所有活動 WebSocket 連接的集合
 *
 */

export function defineWebSocketRoutes() {
  // 建構 Hono 應用
  const app = new Hono();
  app.get("/", (c) => c.text("Hello, Hono!, with WebSocket!"));
  // 1. 創建 WebSocket 工具
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

  const connections = new Set<WSContext>();
  // connections 存的是：[ws1, ws2, ws3, ...]
  // 每個 ws 都是一個獨立的 WebSocket 連接實例
  // connections 是用來儲存所有 WebSocket 連接的容器！

  // 註冊 WebSocket 路由(建構階段)
  // upgradeWebSocket() 返回一個處理器，用於：
  // 1. 檢查請求是否要求升級為 WebSocket
  // 2. 如果是，標記此請求並保存 WebSocket 事件處理器
  // 3. 實際的升級操作由 injectWebSocket(server) 完成

  app.get(
    "/monitor",
    upgradeWebSocket((_c) => ({
      // 觸發時機：WebSocket 連接建立時
      // event 包含連接建立的相關資訊
      // ws 是 WebSocket 連接物件，可以用來發送和接收訊息
      onOpen: (event: Event, ws: WSContext) => {
        const raw = ws.raw as (typeof import("ws"))["WebSocket"]; // 底層 ws 連線
        connections.add(ws);
        console.log(`目前websocket連接數: ${connections.size}`);
        // console.log("WebSocket 實例:", ws);
        ws.send("websocket 連接測試訊息");
      },

      onClose: (event: CloseEvent, ws: WSContext) => {
        // event 包含連接關閉的相關資訊
        // 觸發時機：WebSocket 連接關閉時
        // 用途：清理資源、記錄日誌等
        console.log("WebSocket 連結關閉,事件:", event);

        // ✅ 從連接集合中移除已關閉的連接
        connections.delete(ws);
        console.log(`剩餘連接數: ${connections.size}`);
      },

      onError: (event: Event, ws: WSContext) => {
        // event 包含錯誤的相關資訊
        console.log("WebSocket 發生 錯誤,事件:", event);
        // console.log("WebSocket 實例:", ws);

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
      },
    }))
  );

  return { app, injectWebSocket, connections };
}

/**
 * 啟動 Hono WebSocket 服務器（掛載階段）
 *
 * 此函數會：
 * 1. 調用 defineWebSocketRoutes() 構建應用
 * 2. 啟動 HTTP 服務器並綁定指定端口
 * 3. 注入 WebSocket 升級處理邏輯
 * 4. 註冊優雅關閉處理器 (SIGINT/SIGTERM)
 *
 * @param {Object} [options] - 服務器配置選項
 * @param {number} [options.port=8992] - 監聽的端口號
 *
 * @returns {Object} 服務器實例對象
 * @returns {Server} returns.server - Node.js HTTP Server 實例，可用於手動控制生命週期
 *
 * @throws {Error} 當端口被佔用時拋出 EADDRINUSE 錯誤
 *
 * @example
 * // 使用默認端口
 * const { server } = honoWebSocketServer();
 *
 * @example
 * // 指定端口
 * const { server } = honoWebSocketServer({ port: 3000 });
 *
 * @example
 * // 手動控制生命週期
 * const { server } = honoWebSocketServer({ port: 3000 });
 * setTimeout(() => server.close(), 5000); // 5 秒後關閉
 */

export function honoWebSocketServer({ port = 8992 }: { port?: number } = {}) {
  console.log("正在啟動webSocket server...");
  const { app, injectWebSocket, connections } = defineWebSocketRoutes();

  const server = serve({ fetch: app.fetch, port });
  // 綁定升級邏輯到服務器的 upgrade 事件
  injectWebSocket(server);
  console.log(`Server is running on http://localhost:${port}`);

  const shutdown = () => {
    for (const ws of connections) {
      try {
        ws.close();
      } catch {}
    }
    connections.clear();
    server.close(() => process.exit(0));
  };

  // 系統的Ctrl+C事件-->mac/linux/windows都支援
  process.on("SIGINT", shutdown);
  // 系統的kill事件-->linux/mac都支援,windows部分支援
  process.on("SIGTERM", shutdown);

  // return Node.js HTTP Server 實例
  return { server };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const port = Number(process.env.API_PORT ?? 8992);
  try {
    honoWebSocketServer({ port });
  } catch (error) {
    if ((error as any)?.code === "EADDRINUSE") {
      console.error(`Port ${port} in use`);
      process.exit(1);
    }
    throw error;
  }
}
