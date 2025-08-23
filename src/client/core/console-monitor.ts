import type { JSRuntimeError, ResourceError } from "../types";
import type { Transport } from "../types/console-monitor-types";
import { safeStringify, addTimestamp } from "../utils";

export function consoleMonitor(transport?: Transport) {
  const errorSet = new Set<string>();
  const infoList: string[] = [];
  const warnList: string[] = [];
  const logList: string[] = [];
  const { log, error, warn, info } = console;

  // HACK:取代原本的console.log
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
  const onError = (e: ErrorEvent | Event) => {
    let key: string;
    let errorData: ResourceError | JSRuntimeError;

    // HACK:當e.target !== window → 資源載入錯誤,e.target 是載入失敗的 DOM 元素（如 <img>, <script>, <link>）
    // EX:圖片 404、腳本載入失敗、CSS 檔案不存在
    // 資源錯誤：Event 型別
    if (e.target && e.target !== window) {
      // 交集型別（intersection）斷言
      // 意思是e.target 是 HTMLElement型別的同時「可能」還有 src/href 兩個可選屬性。
      // 這些元素都是 HTMLElement，但有不同的特殊屬性
      // <img src="image.jpg">        // HTMLImageElement - 有 src
      // <script src="script.js">     // HTMLScriptElement - 有 src
      // <link href="style.css">      // HTMLLinkElement - 有 href
      // <a href="page.html">         // HTMLAnchorElement - 有 href
      // <div>                        // HTMLDivElement - 沒有 src/href
      const element = e.target as HTMLElement & { src?: string; href?: string };
      // key會是Resource error(簡寫)|來源類別(元素標籤類型)|取到資源的 URL
      // EX:RES|IMG|image.jpg(url)
      // EX:RES|SCRIPT|script.js
      key = `RES|${element.tagName}|${element.src || element.href || ""}`;
      errorData = {
        type: "resource",
        target: e.target,
      } as const;
    } else {
      //HACK:e.target === window → JavaScript 運行時錯誤,所以e.target 是 window 物件
      // EX:undefined.property、語法錯誤、型別錯誤
      const errorEvent = e as ErrorEvent;
      errorData = {
        type: "js-runtime",
        message: errorEvent.message,
        source: errorEvent.filename,
        line: errorEvent.lineno,
        column: errorEvent.colno,
      } as const;
      key = `JS|${errorEvent.message}|${errorEvent.filename}|${errorEvent.lineno}|${errorEvent.colno}`;
    }
    if (errorSet.has(key)) return;
    errorSet.add(key);
    // normalized = normalizeError(errorData);
    // errorSet.add(addTimestamp(normalized));
  };

  //
  window.addEventListener("error", onError, { capture: true });
  const onRejection = (errorEvent: PromiseRejectionEvent) => {
    const raw = `Promise UnhandledRejection: ${safeStringify(errorEvent.reason)}`;
    // EX: PR|Promise UnhandledRejection: undefined
    const key = `PR|${raw}`;
    if (errorSet.has(key)) return;
    errorSet.add(key);
  };
  window.addEventListener("unhandledrejection", onRejection);

  const stop = () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    console.log = log;
    console.info = info;
    console.warn = warn;
    console.error = error;
  };
  return { errorSet, infoList, warnList, logList, stop };
}
