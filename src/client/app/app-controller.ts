// src / client / app / app - controller.ts;

import { consoleMonitor } from "../core";
import logPage from "./html/console-page.html?raw";

/**
 * 應用控制器 - 管理應用的生命週期和狀態
 *
 * 此做法是根據以下技術去實作
 *  Layered Architecture 分層架構 - Controller Layer
 *
 *
 */

export function appController() {
  let isInitialized = false;
  let isStarted = false;

  const initializeDOM = (): boolean => {
    const app = document.querySelector<HTMLElement>("#pikka-console-web");
    if (!app) {
      console.error("找不到 #app 元素");
      return false;
    }
    app.innerHTML = logPage;

    return true;
  };
  const startCoreServices = (): void => {
    consoleMonitor();
    console.log("核心服務已啟動");
  };

  const initializeDevelopmentMode = (): void => {
    if (import.meta.env.DEV) {
      console.log("應用已啟動 - 開發模式");
      // 取消註釋以啟用測試
      // testConsoleMonitor();
    }
  };

  return {
    initialize(): boolean {
      if (isInitialized) {
        // 代表已經初始化過一次
        console.warn("應用已經初始化過了");
        return true;
      }

      //初始化應用
      if (!initializeDOM) {
        console.error("初始化DOM失敗");
        return false;
      }
      // 啟動console監聽程序
      startCoreServices();
      // 啟動開發者模式
      initializeDevelopmentMode();
      isInitialized = true;

      return true;
    },
    bootUp(): boolean {
      if (!this.initialize()) {
        console.warn("應用程式初始化未完成(可能是初始化失敗)");
        return false;
      }
      if (isStarted) {
        console.log("應用已啟動");
        return true;
      }
      isStarted = true;
      return true;
    },
    restart(): boolean {
      isInitialized = false;
      isStarted = false;
      return this.bootUp();
    },
    stop(): void {
      isStarted = false;
    },
    getApplicationStatus(): { isInitialized: boolean; isStarted: boolean } {
      return {
        isInitialized,
        isStarted,
      };
    },
    isReady(): boolean {
      return isInitialized && isStarted;
    },
  };
}
