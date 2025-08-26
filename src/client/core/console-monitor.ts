import type { JSRuntimeError, ResourceError } from "../types";
import type { Transport } from "../types/console-monitor-types";
import { safeStringify, addTimestamp } from "../utils";

export function consoleMonitor(transport?: Transport) {
  const errorSet = new Set<string>();
  const infoList: string[] = [];
  const warnList: string[] = [];
  const logList: string[] = [];
  const { log, error, warn, info } = console;

  // 更新 UI 的函數
  const updateUI = () => {
    updateLogsList();
    updateInfosList();
    updateWarnsList();
    updateErrorsList();
  };

  const updateLogsList = () => {
    const container = document.getElementById('logs-list');
    if (!container) return;
    
    if (logList.length === 0) {
      container.innerHTML = '<div class="empty-message">等待 console.log 訊息...</div>';
      return;
    }
    
    container.innerHTML = logList
      .map(msg => createMessageHtml(msg, 'log', 'log'))
      .join('');
  };

  const updateInfosList = () => {
    const container = document.getElementById('info-list');
    if (!container) return;
    
    if (infoList.length === 0) {
      container.innerHTML = '<div class="empty-message">等待 console.info 訊息...</div>';
      return;
    }
    
    container.innerHTML = infoList
      .map(msg => createMessageHtml(msg, 'info', 'info'))
      .join('');
  };

  const updateWarnsList = () => {
    const container = document.getElementById('warnings-list');
    if (!container) return;
    
    if (warnList.length === 0) {
      container.innerHTML = '<div class="empty-message">等待 console.warn 訊息...</div>';
      return;
    }
    
    container.innerHTML = warnList
      .map(msg => createMessageHtml(msg, 'warn', 'warn'))
      .join('');
  };

  const updateErrorsList = () => {
    const container = document.getElementById('errors-list');
    if (!container) return;
    
    if (errorSet.size === 0) {
      container.innerHTML = '<div class="empty-message">等待 console.error 訊息...</div>';
      return;
    }
    
    container.innerHTML = Array.from(errorSet)
      .map(msg => createMessageHtml(msg, 'error', 'error'))
      .join('');
  };

  const createMessageHtml = (message: string, type: string, colorClass: string): string => {
    const timestamp = new Date().toLocaleTimeString();
    return `
      <div class="console-message">
        <span class="message-type ${colorClass}">[${type.toUpperCase()}]</span>
        <span class="message-time">[${timestamp}]</span>
        <div class="message-content">${escapeHtml(message)}</div>
      </div>
    `;
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  // HACK:取代原本的console.log
  console.log = (...args: unknown[]) => {
    const message = args.map(safeStringify).join(" ");
    logList.push(message); // 移除 addTimestamp，因為 UI 會自己加
    // HACK:呼叫原本的console.log-->不影響到原本的方法
    log.apply(console, args);
    updateUI(); // 更新界面
  };

  console.error = (...args: unknown[]) => {
    const message = args.map(safeStringify).join(" ");
    errorSet.add(message); // 移除 addTimestamp，因為 UI 會自己加
    error.apply(console, args);
    updateUI(); // 更新界面
  };

  console.warn = (...args: unknown[]) => {
    const message = args.map(safeStringify).join(" ");
    warnList.push(message); // 移除 addTimestamp，因為 UI 會自己加
    // HACK:呼叫原本的console.warn-->不影響到原本的方法
    warn.apply(console, args);
    updateUI(); // 更新界面
  };

  console.info = (...args: unknown[]) => {
    const message = args.map(safeStringify).join(" ");
    infoList.push(message); // 移除 addTimestamp，因為 UI 會自己加
    info.apply(console, args);
    updateUI(); // 更新界面
  };

  const onError = (e: ErrorEvent | Event) => {
    let key: string;
    let errorData: ResourceError | JSRuntimeError;
    let displayMessage: string;

    // HACK:當e.target !== window → 資源載入錯誤,e.target 是載入失敗的 DOM 元素（如 <img>, <script>, <link>）
    // EX:圖片 404、腳本載入失敗、CSS 檔案不存在
    // 資源錯誤：Event 型別
    if (e.target && e.target !== window) {
      const element = e.target as HTMLElement & { src?: string; href?: string };
      key = `RES|${element.tagName}|${element.src || element.href || ""}`;
      displayMessage = `Resource Error: ${element.tagName} failed to load - ${element.src || element.href || "unknown"}`;
      errorData = {
        type: "resource",
        target: e.target,
      } as const;
    } else {
      //HACK:e.target === window → JavaScript 運行時錯誤,所以e.target 是 window 物件
      // EX:undefined.property、語法錯誤、型別錯誤
      const errorEvent = e as ErrorEvent;
      key = `JS|${errorEvent.message}|${errorEvent.filename}|${errorEvent.lineno}|${errorEvent.colno}`;
      displayMessage = `Runtime Error: ${errorEvent.message} at ${errorEvent.filename}:${errorEvent.lineno}:${errorEvent.colno}`;
      errorData = {
        type: "js-runtime",
        message: errorEvent.message,
        source: errorEvent.filename,
        line: errorEvent.lineno,
        column: errorEvent.colno,
      } as const;
    }
    
    if (errorSet.has(key)) return;
    errorSet.add(displayMessage); // 添加可讀的錯誤訊息
    updateUI(); // 更新界面
  };

  window.addEventListener("error", onError, { capture: true });
  
  const onRejection = (errorEvent: PromiseRejectionEvent) => {
    const raw = `Promise UnhandledRejection: ${safeStringify(errorEvent.reason)}`;
    const key = `PR|${raw}`;
    if (errorSet.has(key)) return;
    errorSet.add(raw); // 添加可讀的錯誤訊息
    updateUI(); // 更新界面
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

  const clearAll = () => {
    errorSet.clear();
    infoList.length = 0;
    warnList.length = 0;
    logList.length = 0;
    updateUI();
  };

  // 初始化 UI
  setTimeout(updateUI, 100); // 給 DOM 一點時間載入

  return { 
    errorSet, 
    infoList, 
    warnList, 
    logList, 
    stop, 
    clearAll,
    updateUI 
  };
}