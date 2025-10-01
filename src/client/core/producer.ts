import { createConsoleInterceptor } from "@/client/core/console-interceptor";
import { createErrorCollector } from "@/client/core/error-collector";

// 發信機
export const producer = (_channel: string) => {
  const ws = new WebSocket("ws://localhost:8992/monitor");
  // const broadcastChannel = new BroadcastChannel(channel);

  const consoleInterceptor = createConsoleInterceptor({
    callback: (data) => {
      // broadcastChannel.postMessage(data);
      ws.send(JSON.stringify(data));
      // console.log("Sent data:", data);
    },
  });
  const errorCollector = createErrorCollector({
    callback: (data) => {
      // broadcastChannel.postMessage(data);
      ws.send(JSON.stringify(data));
      // console.log("Sent error:", data);
    },
  });
  const start = () => {
    consoleInterceptor.start();
    errorCollector.start();
  };
  const stop = () => {
    consoleInterceptor.stop();
    errorCollector.stop();
    // broadcastChannel.close();
    ws.close();
  };

  return { start, stop };
};
