import type { IChannel } from "@/client/types";
import { consoleInterceptor } from "@/client/core/console-interceptor";
import { errorCollector } from "@/client/core/error-collector";

export const producer = (channel: IChannel) => {
  //   constconsoleInterceptor(channel);
  //   errorCollector(channel);
};
