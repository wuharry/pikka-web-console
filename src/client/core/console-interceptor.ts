// src/client/core/console-interceptor.ts
import { safeStringify, addTimestamp } from "../utils";
import type { ConsolePayload } from "@/client/types";

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

const createConsoleInterceptor = ({
  callback,
}: {
  callback: (data: ConsolePayload) => void;
}) => {
  const { log, warn, info } = console;
  const start = () => {
    console.log = (...args: unknown[]) => {
      const payload: ConsolePayload = {
        level: "log",
        args,
        message: args.map(safeStringify).join(" "),
        timestamp: addTimestamp(),
        source: {
          tabId: "",
          url: location.pathname + location.search + location.hash, //用來檢視log的頁面路徑跟其參數
          origin: location.origin, //域名
        },
      };
      callback(payload);
      // 同理apply(console, args)但是更簡潔更現代
      // console[payload.level](...args);
      log.apply(console, args);
    };
    console.warn = (...args: unknown[]) => {
      const payload: ConsolePayload = {
        level: "warn",
        args,
        message: args.map(safeStringify).join(" "),
        timestamp: addTimestamp(),
        source: {
          tabId: "",
          url: location.pathname + location.search + location.hash, //用來檢視log的頁面路徑跟其參數
          origin: location.origin, //域名
        },
      };
      callback(payload);

      // console[payload.level](...args);
      warn.apply(console, args);
    };

    console.info = (...args: unknown[]) => {
      const payload: ConsolePayload = {
        level: "info",
        args,
        message: args.map(safeStringify).join(" "),
        timestamp: addTimestamp(),
        source: {
          tabId: "",
          url: location.pathname + location.search + location.hash, //用來檢視log的頁面路徑跟其參數
          origin: location.origin, //域名
        },
      };
      // console[payload.level](...args);
      callback(payload);
      info.apply(console, args);
    };
  };

  const stop = () => {
    console.log = log;
    console.info = info;
    console.warn = warn;
  };

  return {
    stop,
    start,
  };
};

export { createConsoleInterceptor };
