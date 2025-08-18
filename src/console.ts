export function consoleMonitor() {
  const errorSet = new Set<string>();
  const infoList: string[] = [];
  const warnList: string[] = [];
  const logList: string[] = [];
  const { log, error, warn, info } = console;

  const safeStringify = (arg: unknown) => {
    try {
      return typeof arg === "string" ? arg : JSON.stringify(arg);
    } catch {
      return "[Unserializable]";
    }
  };

  // 添加時間戳的輔助函數
  const addTimestamp = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    return `[${timestamp}] ${message}`;
  };

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
  // 捕捉資源錯誤的
  window.onerror = (message, source, lineno, colno, error) => {
    const errorData: JSRuntimeError = {
      type: "js-runtime",
      message,
      source,
      line: lineno,
      column: colno,
    };
    const errorString = normalizeError(errorData);
    errorSet.add(addTimestamp(errorString));
    // console.error(errorString);
  };
  window.addEventListener("error", (e: ErrorEvent) => {
    let normalized: string;
    let errorData: ResourceError | JSRuntimeError;

    // HACK:當e.target !== window → 資源載入錯誤,e.target 是載入失敗的 DOM 元素（如 <img>, <script>, <link>）
    // EX:圖片 404、腳本載入失敗、CSS 檔案不存在
    if (e.target && e.target !== window) {
      errorData = {
        type: "resource",
        target: e.target,
      } as const;
    }
    //HACK:e.target === window → JavaScript 運行時錯誤,所以e.target 是 window 物件
    // EX:undefined.property、語法錯誤、型別錯誤
    else if (e.target && e.target === window) {
      errorData = {
        type: "js-runtime",
        message: e.message,
        source: e.filename,
        line: e.lineno,
        column: e.colno,
      } as const;
    } else {
      // HACK:第三種情況,我可能沒有考慮到的那種lol
      return;
    }
    normalized = normalizeError(errorData);

    errorSet.add(addTimestamp(normalized));
  });
  window.addEventListener("unhandledrejection", (ev) => {
    errorSet.add(`Promise UnhandledRejection: ${safeStringify(ev.reason)}`);
  });

  return { errorSet, infoList, warnList, logList };
}

type JSRuntimeError = {
  type: "js-runtime";
  message: string | Event;
  source?: string;
  line?: number;
  column?: number;
};

type ResourceError = {
  type: "resource";
  target: HTMLElement | EventTarget;
};

type UnknownError = {
  type: "unknown";
  data: any;
};

type ErrorData = JSRuntimeError | ResourceError | UnknownError;

function normalizeError(data: ErrorData): string {
  if (data.type === "js-runtime") {
    return `JS: ${data.message} at ${data.source}:${data.line}`;
  } else if (data.type === "resource") {
    // HACK:資源載入有多種情況,可能是以下DOM引起<img>、<script>、<link>
    // 所以需要額外判斷
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

export function testConsoleMonitor() {
  console.log("開始測試 Console Monitor...");

  setTimeout(() => {
    console.log("這是一個 log 消息");
    console.info("這是一個 info 消息");
    console.warn("這是一個 warning 消息");
    console.error("這是一個 error 消息");

    // 測試語法錯誤（這會被 console.error 捕獲）
    try {
      eval("<invalid syntax>");
    } catch (e) {
      console.error("Syntax Error:", e);
    }

    // 測試運行時錯誤
    setTimeout(() => {
      try {
        // @ts-ignore
        undefinedVariable.someProperty;
      } catch (e) {
        console.error("Runtime Error:", e);
      }
    }, 1000);

    // 測試資源錯誤
    const img = new Image();
    img.src = "https://example.com/nonexistent.jpg";
    document.body.appendChild(img);
  }, 500);
}
