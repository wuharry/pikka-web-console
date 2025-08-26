// src/client/core/console-interceptor.ts
import { safeStringify, addTimestamp } from "../utils";
import type { PartialConsoleDataStore } from "@/client/types";

const consoleInterceptor = ({
  errorSet = new Set<string>(),
  infoList = [],
  warnList = [],
  logList = [],
}: PartialConsoleDataStore) => {
  const { log, error, warn, info } = console;

  console.log = (...args: unknown[]) => {
    const message = args.map(safeStringify).join(" ");
    logList.push(addTimestamp(message));
    // HACK:呼叫原本的console.log-->不影響到原本的方法
    log.apply(console, args);
  };

  console.error = (...args: unknown[]) => {
    const message = args.map(safeStringify).join(" ");
    errorSet.add(addTimestamp(message));

    error.apply(console, args);
  };

  console.warn = (...args: unknown[]) => {
    const message = args.map(safeStringify).join(" ");
    warnList.push(addTimestamp(message));

    // HACK:呼叫原本的console.warn-->不影響到原本的方法
    warn.apply(console, args);
  };

  console.info = (...args: unknown[]) => {
    const message = args.map(safeStringify).join(" ");
    infoList.push(addTimestamp(message));
    info.apply(console, args);
  };

  const restoreLog = () => {
    console.log = log;
    console.info = info;
    console.warn = warn;
    console.error = error;
  };

  return {
    restoreLog,
  };
};

export { consoleInterceptor };
