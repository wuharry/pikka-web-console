// src/client/core/consumer.ts
import type { StateStore } from "../types/ports.types";

const consumer = (_channelName: string, onDataUpdate?: () => void) => {
  //工廠模式封裝
  const stateStore: StateStore = {
    error: [],
    info: [],
    warn: [],
    log: [],
  };

  const ws = new WebSocket("ws://localhost:8992/monitor");

  const init = () => {
    ws.addEventListener("message", messageHandler);
  };
  init();

  // 轉化接收到的訊息
  function messageHandler(event: MessageEvent) {
    const data = event.data;

    if (!data || !data.message) {
      return;
    }

    // 處理 ConsolePayload
    if ("level" in data && data.level) {
      stateStore[data.level as keyof StateStore].push(data);
    }
    // 處理 ErrorPayload
    else if ("name" in data) {
      stateStore.error.push(data);
    }

    if (onDataUpdate) {
      onDataUpdate();
    }
  }

  const cleanUp = () => {
    ws.removeEventListener("message", messageHandler);
    ws.close();
  };
  return {
    getChannelData: () => {
      const { error, info, warn, log } = stateStore;
      return { error, info, warn, log };
    },
    cleanUp,
  };
};

export { consumer };
