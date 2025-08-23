// src/main.ts
import "../../assets/styles";

import logPage from "./html/console-page.html?raw";
// import { testConsoleMonitor } from "./console.ts";

const initializeDOM = (): void => {
  const app = document.querySelector<HTMLElement>("#pikka-console-web");
  if (!app) {
    console.error("找不到 #app 元素");
    return;
  }
  app.innerHTML = logPage;
};
window.addEventListener("DOMContentLoaded", () => {
  setupTabs();
});

function bootsStartUp(): void {
  initializeDOM();
  if (import.meta.env.DEV) {
    console.log("應用已啟動 - 開發模式");
    // 取消註釋以啟用測試
    // testConsoleMonitor();
  }
}

// 檢測執行這段code的環境是不是在瀏覽器環境中執行
//SSR,Node環境有自己的終端
if (typeof window !== "undefined") {
  // windows.(自定義要掛載的方法)=函式(自訂)
  // (window as any).consoleApp = appController;
}

// DOM 載入完成後啟動console監聽器應用
if (document.readyState === "loading") {
  // 因為有once所以不用卸載這個監聽器
  document.addEventListener("DOMContentLoaded", bootsStartUp, { once: true });
} else {
  bootsStartUp();
}
