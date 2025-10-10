// src/client/core/consumer.ts
import type { StateStore } from "../types/ports.types";

const consumer = (handleRender?: () => void) => {
  //工廠模式封裝
  const stateStore: StateStore = {
    error: [],
    info: [],
    warn: [],
    log: [],
  };
  let webSocketIsAlive = false;
  let ws: WebSocket;

  const init = (wsUrl = "ws://localhost:8992/monitor") => {
    // console.log("[consumer.init] 呼叫", wsUrl);
    return new Promise<void>((resolve, reject) => {
      ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        webSocketIsAlive = true;
        resolve();
      };
      ws.onerror = (err) => {
        webSocketIsAlive = false;
        reject(err);
      };
      ws.onclose = () => {
        webSocketIsAlive = false;
      };
      ws.onmessage = messageHandler;
    });
  };

  // 轉化接收到的訊息
  function messageHandler(event: MessageEvent) {
    if (!webSocketIsAlive) {
      // console.warn("WebSocket 尚未連線，無法處理訊息");
      return;
    }
    if (!event.data) {
      // console.warn("WebSocket 訊息為空");
      return;
    }
    const data = JSON.parse(event.data);
    // console.log("收到訊息😊👌👌", data);

    // 處理 ConsolePayload
    if ("level" in data && data.level) {
      stateStore[data.level as keyof StateStore].push(data);
    }
    // 處理 ErrorPayload
    else if ("name" in data) {
      stateStore.error.push(data);
    }

    if (handleRender) {
      handleRender();
    }
  }

  const cleanUp = () => {
    ws.removeEventListener("message", messageHandler);
    ws.close();
  };
  return {
    init,
    getChannelData: () => {
      const { error, info, warn, log } = stateStore;
      return { error, info, warn, log };
    },
    cleanUp,
  };
};

export { consumer };
