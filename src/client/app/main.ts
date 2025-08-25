// src / client / app / main.ts;

import { appController } from "./app-controller";

const app = appController();

function bootsStartUp(): void {
  const success = app.bootUp();

  if (!success) {
    console.error("應用啟動失敗");
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
