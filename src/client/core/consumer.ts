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
      return;
    }
    if (!event.data) {
      return;
    }
    const data = JSON.parse(event.data);

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
