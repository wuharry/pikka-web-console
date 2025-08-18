// src/client/core/console-monitor.ts
import type { 
  ConsoleMonitorData, 
  ErrorData, 
  JSRuntimeError, 
  ResourceError 
} from '../../shared/types/console.types';

export class ConsoleMonitor {
  private errorSet = new Set<string>();
  private infoList: string[] = [];
  private warnList: string[] = [];
  private logList: string[] = [];
  
  // 保存原始 console 方法
  private originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.overrideConsoleMethods();
    this.setupErrorHandlers();
  }

  private overrideConsoleMethods(): void {
    console.log = (...args: unknown[]) => {
      const message = args.map(this.safeStringify).join(" ");
      this.logList.push(this.addTimestamp(message));
      this.originalConsole.log.apply(console, args);
    };

    console.error = (...args: unknown[]) => {
      const message = args.map(this.safeStringify).join(" ");
      this.errorSet.add(this.addTimestamp(message));
      this.originalConsole.error.apply(console, args);
    };

    console.warn = (...args: unknown[]) => {
      const message = args.map(this.safeStringify).join(" ");
      this.warnList.push(this.addTimestamp(message));
      this.originalConsole.warn.apply(console, args);
    };

    console.info = (...args: unknown[]) => {
      const message = args.map(this.safeStringify).join(" ");
      this.infoList.push(this.addTimestamp(message));
      this.originalConsole.info.apply(console, args);
    };
  }

  private setupErrorHandlers(): void {
    // 全域錯誤處理
    window.onerror = (message, source, lineno, colno, error) => {
      const errorData: JSRuntimeError = {
        type: "js-runtime",
        message,
        source,
        line: lineno,
        column: colno,
      };
      const errorString = this.normalizeError(errorData);
      this.errorSet.add(this.addTimestamp(errorString));
    };

    // 資源載入錯誤處理
    window.addEventListener("error", (e: ErrorEvent) => {
      let errorData: ResourceError | JSRuntimeError;

      if (e.target && e.target !== window) {
        // 資源載入錯誤
        errorData = {
          type: "resource",
          target: e.target,
        } as const;
      } else if (e.target && e.target === window) {
        // JavaScript 運行時錯誤
        errorData = {
          type: "js-runtime",
          message: e.message,
          source: e.filename,
          line: e.lineno,
          column: e.colno,
        } as const;
      } else {
        return;
      }

      const normalized = this.normalizeError(errorData);
      this.errorSet.add(this.addTimestamp(normalized));
    });

    // Promise rejection 錯誤處理
    window.addEventListener("unhandledrejection", (ev) => {
      this.errorSet.add(
        this.addTimestamp(`Promise UnhandledRejection: ${this.safeStringify(ev.reason)}`)
      );
    });
  }

  private safeStringify(arg: unknown): string {
    try {
      return typeof arg === "string" ? arg : JSON.stringify(arg);
    } catch {
      return "[Unserializable]";
    }
  }

  private addTimestamp(message: string): string {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${message}`;
  }

  private normalizeError(data: ErrorData): string {
    if (data.type === "js-runtime") {
      return `JS: ${data.message} at ${data.source}:${data.line}`;
    } else if (data.type === "resource") {
      if (data.target instanceof HTMLImageElement) {
        return `Resource Error: Image failed to load ${data.target.src}`;
      }
      if (data.target instanceof HTMLScriptElement) {
        return `Resource Error: Script failed to load ${data.target.src}`;
      }
      if (data.target instanceof HTMLLinkElement) {
        return `Resource Error: Link failed to load ${data.target.href}`;
      }
      return `Resource Error: Unknown target ${data.target}`;
    }
    return `Unknown: ${JSON.stringify(data)}`;
  }

  public getMonitorData(): ConsoleMonitorData {
    return {
      errorSet: this.errorSet,
      infoList: this.infoList,
      warnList: this.warnList,
      logList: this.logList,
    };
  }

  public clear(): void {
    this.errorSet.clear();
    this.infoList.length = 0;
    this.warnList.length = 0;
    this.logList.length = 0;
  }

  public destroy(): void {
    // 恢復原始 console 方法
    Object.assign(console, this.originalConsole);
    
    // 移除事件監聽器
    window.onerror = null;
    // Note: 無法移除 addEventListener 添加的監聽器，因為我們沒有保存引用
  }
}

// 單例模式
let consoleMonitorInstance: ConsoleMonitor | null = null;

export function getConsoleMonitor(): ConsoleMonitor {
  if (!consoleMonitorInstance) {
    consoleMonitorInstance = new ConsoleMonitor();
  }
  return consoleMonitorInstance;
}

// 向後兼容的工廠函數
export function consoleMonitor(): ConsoleMonitorData {
  return getConsoleMonitor().getMonitorData();
}
