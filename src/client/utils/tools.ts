// 工具函數集合
// src\client\utils\tools.ts

export const safeStringify = (arg: unknown): string => {
  // 避免循環引用object1.A=object1,
  // 使用WeakSet來追蹤已處理的物件,WeakSet跟Set類似,但不會阻止垃圾回收(更加安全)
  const seen = new WeakSet<object>();
  const argTypeMappingFunc = {
    string: (arg: string) => arg,
    number: (arg: number) => arg.toString(),
    boolean: (arg: boolean) => arg.toString(),
    object: (arg: object) =>
      JSON.stringify(arg, (_key, value) => {
        if (typeof value === "object" && value !== null) {
          // 如果循環引用
          if (seen.has(value)) return "[Circular]";
          seen.add(value);
        }
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          };
        }
        return value;
      }),
    function: (arg: Function) => `[Function: ${arg.name || "anonymous"}]`,
    symbol: (arg: symbol) => arg.toString(),
    bigint: (arg: bigint) => arg.toString() + "n",
    undefined: () => "undefined",
  } as const;

  try {
    const type = typeof arg;
    if (type in argTypeMappingFunc) {
      const handler = argTypeMappingFunc[type];
      return handler(arg as never);
    }
    return String(arg);
  } catch {
    return "[Unserializable]";
  }
};

export const addTimestamp = () => {
  return Date.now();
};

export function testConsoleMonitor() {
  console.log("開始測試 Console Monitor...");

  setTimeout(() => {
    console.log("🧪 測試開始 - 這應該會出現在你的控制台");
    console.info("這是一個 info 消息");
    console.warn("⚠️  警告測試");
    console.error("❌ 錯誤測試");
    // setTimeout(() => {
    //   console.log("🕐 延遲測試訊息");
    // }, 2000);
    console.log("📦 物件測試", { user: "test", timestamp: Date.now() });

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

export const formatTimestamp = (timestamp: number) => {
  return new Date(timestamp).toLocaleTimeString("zh-TW", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
};
