// src / client / app / main.ts;
import { appController } from "./app-controller";
import "../../style.css"; // 這個是重複加入的,所以需要特別注意,如果沒有必要就可以刪除

/**
 * 客戶端應用入口
 *
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Client App Layer
 * 職責：環境檢測、DOM 就緒檢測、應用啟動協調
 * - **環境檢測**：檢測是否在瀏覽器環境中運行，避免 SSR 環境問題
 *- **DOM 就緒檢測**：智能檢測 DOM 載入狀態，適時啟動應用
 *- **全域物件掛載**：將應用實例掛載到 `window.consoleApp`
 *- **應用啟動協調**：調用應用控制器進行啟動流程
 */

const app = appController();

function bootsStartUp(): void {
  const success = app.bootUp();

  if (!success) {
    // console.error("應用啟動失敗");
    return;
  }

  // 檢測執行這段code的環境是不是在瀏覽器環境中執行
  // false → window 存在 --> 代表 現在是在瀏覽器中執行，因為瀏覽器才有 window 這個全域物件。
  if (typeof window !== "undefined") {
    // windows.(自定義要掛載的方法)=函式(自訂)
    (window as any).consoleApp = app;
  }
}

// 環境檢測跟啟動
function initializeApp(): boolean {
  // 檢測執行這段code的環境是不是在瀏覽器環境中執行
  // true → window 是 undefined--->代表 現在的執行環境沒有 window 物件。
  // SSR,Node環境有自己的終端
  if (typeof window === "undefined") {
    return false;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootsStartUp, { once: true });
    return false;
  } else {
    bootsStartUp();
    return true;
  }
}
initializeApp();
