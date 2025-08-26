// src/client/core/console-interceptor.ts
import { safeStringify, addTimestamp } from "../utils";
import type { PartialConsoleDataStore } from "@/client/types";

/**
 * 控制台攔截器 - 攔截和監控原生 console 方法
 *
 * 技術實作基礎：
 * Interceptor Pattern 攔截器模式
 * 職責：整裝原生 API，不破壞原有功能，增加監控能力
 * - **方法攔截**：攔截 `console.log`、`console.error`、`console.warn`、`console.info`
 * - **數據序列化**：安全序列化各種數據類型（透過 `safeStringify`）
 * - **時間戳增加**：為所有訊息增加時間戳（透過 `addTimestamp`）
 * - **原始功能保持**：使用 `apply` 調用原始 console 方法
 * - **可還原性**：提供 `restoreLog` 方法恢復原始狀態
 *
 */

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
