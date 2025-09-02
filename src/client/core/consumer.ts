// src/client/core/consumer.ts
import type { StateStore } from "../types/ports.types";

const consumer = (channelName: string) => {
  //工廠模式封裝
  const stateStore: StateStore = {
    error: [],
    info: [],
    warn: [],
    log: [],
  };

  const broadcastChannel = new BroadcastChannel(channelName);
  const init = () => {
    broadcastChannel.addEventListener("message", messageHandler);
  };
  init();
  // 轉化接收到的訊息
  const messageHandler = (event: MessageEvent) => {
    const data = event.data;
    if (!data?.level || !data?.message) return;
    stateStore[data.level as keyof StateStore].push(data);
    console.log("Received data:", data);
  };

  const cleanUp = () => {
    broadcastChannel.removeEventListener("message", messageHandler);
    broadcastChannel.close();
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
