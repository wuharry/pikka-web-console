// src/client/app/main.ts
import "../../assets/styles/app.css";
import { initializeApp } from './app-controller';
import { testConsoleMonitor } from '../core/test-utils';
import consolePageTemplate from "../../assets/templates/console-page.template.html?raw";

/**
 * 應用程序入口點
 * 負責初始化 DOM 和啟動應用
 */
function initializeDOM(): void {
  const app = document.querySelector<HTMLElement>("#app");
  if (!app) {
    console.error("找不到 #app 元素");
    return;
  }

  // 插入 HTML 模板
  app.innerHTML = consolePageTemplate;
}

/**
 * 應用程序啟動
 */
function bootstrap(): void {
  initializeDOM();
  
  // 初始化應用控制器
  const appController = initializeApp();

  // 開發環境下可以啟用測試
  if (import.meta.env.DEV) {
    console.log("應用已啟動 - 開發模式");
    // 取消註釋以啟用測試
    // testConsoleMonitor();
  }

  // 在全域暴露 appController，方便調試
  if (typeof window !== 'undefined') {
    (window as any).consoleApp = appController;
  }
}

// DOM 載入完成後啟動應用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
