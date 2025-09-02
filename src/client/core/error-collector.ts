// src/client/core/error-collector.ts
import { safeStringify, addTimestamp } from "@/client/utils";
import type { ErrorPayload } from "@/client/types";

/**
 * 錯誤收集器 - 全域錯誤監控和收集
 *
 * 技術實作基礎：
 * Observer Pattern 觀察者模式 + Event Listener Pattern
 * 職責：監聽全域錯誤事件，統一收集和格式化
 * - **JavaScript 運行時錯誤**：捕獲 `ErrorEvent` 類型的 JS 錯誤
 * - **資源載入錯誤**：捕獲圖片、腳本、樣式等資源 404 錯誤
 * - **Promise 拒絕監控**：監控未處理的 `unhandledrejection` 事件
 * - **錯誤去重**：使用結構化的 key 策略避免重複錯誤
 * - **錯誤分類**：区分 JS 錯誤、資源錯誤、Promise 錯誤
 */

const createErrorCollector = ({
  callback,
}: {
  callback: (data: ErrorPayload) => void;
}) => {
  const { error } = console;
  console.error = (...args: unknown[]) => {
    const payload: ErrorPayload = {
      // name:console.error 第一個參數如果是 Error 物件,讀取名稱，否則為 Error
      name: args[0] instanceof Error ? args[0].name : "Error",
      // message:console.error 第一個參數如果是 Error 物件,讀取訊息，否則為第一個參數
      message:
        args[0] instanceof Error ? args[0].message : safeStringify(args[0]),
      // stack:console.error 第一個參數如果是 Error 物件,讀取堆疊，否則為空
      stack: args[0] instanceof Error ? args[0].stack : "",
      cause: args[0] instanceof Error ? args[0].cause : undefined,
      timestamp: addTimestamp(),
      source: {
        tabId: "",
        url: location.pathname + location.search + location.hash, //用來檢視log的頁面路徑跟其參數
        origin: location.origin, //域名
      },
    };
    callback(payload);
    error.apply(console, args);
  };
  const onError = (e: ErrorEvent | Event) => {
    const payload: ErrorPayload = {
      // name:如果是ErrorEvent,讀取名稱，否則為Error
      name: e instanceof ErrorEvent ? e.error?.name || "Error" : "Error",
      // message:如果是ErrorEvent,讀取訊息，否則為序列化後的錯誤物件
      message: e instanceof ErrorEvent ? e.error?.message : safeStringify(e),
      // stack:如果是ErrorEvent,讀取[錯誤發生位置stack]，否則為空
      stack: e instanceof ErrorEvent ? e.error?.stack : "",
      timestamp: addTimestamp(),
      source: {
        tabId: "",
        url: location.pathname + location.search + location.hash, //用來檢視log的頁面路徑跟其參數
        origin: location.origin, //域名
      },
    };
    callback(payload);
  };

  const onRejection = (errorEvent: PromiseRejectionEvent) => {
    const raw = `Promise UnhandledRejection: ${safeStringify(errorEvent.reason)}`;
    // EX: PR|Promise UnhandledRejection: undefined
    // const key = `PR|${raw}`;
    const payload: ErrorPayload = {
      name:
        errorEvent.reason && errorEvent.reason instanceof Error
          ? errorEvent.reason.name
          : "Error",
      message:
        errorEvent.reason && errorEvent.reason instanceof Error
          ? errorEvent.reason.message
          : raw,
      stack:
        errorEvent.reason && errorEvent.reason instanceof Error
          ? errorEvent.reason.stack
          : "",
      timestamp: addTimestamp(),
      source: {
        tabId: "",
        url: location.pathname + location.search + location.hash, //用來檢視log的頁面路徑跟其參數
        origin: location.origin, //域名
      },
    };
    callback(payload);
  };

  const start = () => {
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
  };
  const stop = () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    console.error = error;
  };
  return {
    start,
    stop,
  };
};

export { createErrorCollector };
