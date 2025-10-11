// src\mian.ts
import "./style.css";
/**
 * Pikka Web Console - 主入口點
 *
 * 提供開發時的 Web 控制台功能
 *
 * @example
 * ```typescript
 * import PikkaWebConsole from 'pikka-web-console';
 */

declare const __PIKKA_CONSOLE__: boolean;
// 判斷是否為 Console 頁面
const isConsolePage =
  typeof __PIKKA_CONSOLE__ !== "undefined" && __PIKKA_CONSOLE__;
if (isConsolePage) {
  // ✅ Console 頁：只載 UI（consumer），不要啟動 producer
  console.log("🎯 [Pikka] 載入 Console UI 模式");
  import("./client/app/main");
} else {
  // ✅ 主專案頁面：啟動 Producer
  import("./client/core").then(({ createConsoleMonitor }) => {
    const monitor = createConsoleMonitor();
    try {
      monitor.start();
      console.log("✅ [Pikka] Console Producer 已啟動");
    } catch (error) {
      // 不中斷主專案，失敗僅提示
      console.warn("⚠️ [Pikka] Producer 啟動失敗:", error);
    }

    // 暴露控制介面
    if (typeof window !== "undefined") {
      (window as any).__pikkaProducer = {
        stop: () => monitor.cleanUp(),
        restart: () => monitor.start(),
      };
    }
  });
}

// 可選：輸出 consoleApp 讓使用者也能手動控制 UI（方案 B）
export { createConsoleMonitor } from "./client/core";
export { consoleApp } from "./client/app/main";
