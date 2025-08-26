
// 工具函數集合
// src\client\utils\tools.ts
export const safeStringify = (arg: unknown) => {
  try {
    return typeof arg === "string" ? arg : JSON.stringify(arg);
  } catch {
    return "[Unserializable]";
  }
};

export const addTimestamp = (message: string) => {
  const timestamp = new Date().toLocaleTimeString();
  return `[${timestamp}] ${message}`;
};

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
