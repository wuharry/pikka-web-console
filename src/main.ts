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
  // ✅ Console 頁：只啟 UI（consumer），不要起 producer
  import("./client/app/main");
} else {
  // ❌ 非 Console 頁：只啟 producer，不要起 UI（consumer）
  import("./client/core").then(({ createConsoleMonitor }) => {
    const svc = createConsoleMonitor();
    try {
      svc.start();
    } catch (e) {
      // 用原生 console（被攔之前的引用較安全，至少不要 throw）
      console && console.warn && console.warn("[pikka] start failed:", e);
    }
  });
}
export * from "./client/app/main";
