import { createConsoleInterceptor } from "@/client/core/console-interceptor";
import { createErrorCollector } from "@/client/core/error-collector";

// 發信機
export const producer = (_channel: string) => {
  let ws: WebSocket;
  let webSocketIsAlive = false;
  // TODO:之後請log來確認資料的型別
  const messageQueue: any[] = [];

  const init = (url = "ws://localhost:8992/monitor") => {
    return new Promise<void>((resolve, reject) => {
      const wsUrl = url || "ws://localhost:8992/monitor";
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        webSocketIsAlive = true;
        console.log("WebSocket 連線已啟動");
        while (messageQueue.length > 0) {
          const msg = messageQueue.shift();
          ws.send(JSON.stringify(msg));
        }
        resolve();
      };
      ws.onerror = () => {
        webSocketIsAlive = false;
        console.log("WebSocket 連線發生錯誤");
        reject();
      };
      ws.onclose = () => {
        webSocketIsAlive = false;
        console.log("WebSocket 連線已關閉");
      };
    });
  };
  const safeSend = (data: any) => {
    if (webSocketIsAlive && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    } else {
      messageQueue.push(data); // 排隊等連接
    }
  };
  const consoleInterceptor = createConsoleInterceptor({
    callback: (data) => {
      safeSend(data);
    },
  });

  const errorCollector = createErrorCollector({
    callback: (data) => {
      safeSend(data);
    },
  });

  const start = () => {
    consoleInterceptor.start();
    errorCollector.start();
  };
  const stop = () => {
    consoleInterceptor.stop();
    errorCollector.stop();
    ws.close();
  };

  return { init, start, stop };
};
