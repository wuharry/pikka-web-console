// src\mian.ts
import "./client/app/main";
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
// 只有在 Pikka Console 頁面才會載入這個模組
const isConsolePage =
  typeof __PIKKA_CONSOLE__ !== "undefined" && __PIKKA_CONSOLE__ === true;
if (isConsolePage) {
  // ✅ Console 頁：只載 UI（consumer），不要啟動 producer
  import("./client/app/main");
} else {
  // ✅ 主專案頁：啟動 producer（攔截 console 並送往 WS）
  import("./client/core").then(({ createConsoleMonitor }) => {
    const svc = createConsoleMonitor();
    try {
      svc.start();
    } catch (error) {
      // 不中斷主專案，失敗僅提示
      console.warn("[pikka] producer start failed:", error);
    }

    // 也可以選擇 export 出來給使用者呼叫停止
    (window as any).pikkaConsoleStop = () => svc.cleanUp();
  });
}

// 可選：輸出 consoleApp 讓使用者也能手動控制 UI（方案 B）
export { consoleApp } from "./client/app/main"; // 若 main 有 export
