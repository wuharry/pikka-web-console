import { createConsoleInterceptor } from "@/client/core/console-interceptor";
import { createErrorCollector } from "@/client/core/error-collector";

// 發信機
export const producer = (channel: string) => {
  const broadcastChannel = new BroadcastChannel(channel);

  const consoleInterceptor = createConsoleInterceptor({
    callback: (data) => {
      broadcastChannel.postMessage(data);
    },
  });
  const errorCollector = createErrorCollector({
    callback: (data) => {
      broadcastChannel.postMessage(data);
    },
  });
  const start = () => {
    consoleInterceptor.start();
    errorCollector.start();
  };
  const stop = () => {
    consoleInterceptor.stop();
    errorCollector.stop();
    broadcastChannel.close();
  };

  return { start, stop };
};
