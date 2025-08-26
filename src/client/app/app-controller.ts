// src / client / app / app - controller.ts;
import { createUIController } from "@/client/components/main";
import { testConsoleMonitor } from "../utils";
import logPage from "@assets/template/console-page.html?raw";

/**
 * 應用控制器 - 管理應用的生命週期和狀態
 *
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Application Layer
 * 職責：協調各層，管理應用生命週期，不包含具體業務邏輯
 */

export function appController() {
  let isInitialized = false;
  let isStarted = false;
  let ui: ReturnType<typeof createUIController> | null = null;

  const initializeDOM = (): boolean => {
    const app = document.querySelector<HTMLElement>("#pikka-console-web");
    if (!app) {
      console.error("找不到 #app 元素");
      return false;
    }
    app.innerHTML = logPage;

    return true;
  };

  const startCoreServices = (): boolean => {
    // render跟掛載監聽器
    ui = createUIController();
    ui.render();
    if (!ui) {
      console.error("UI 控制器未初始化，無法啟動服務");
      return false;
    }
    console.log("核心服務已啟動");
    return true;
  };

  const initializeDevelopmentMode = (): void => {
    if (import.meta.env.DEV) {
      console.log("應用已啟動 - 開發模式");
      // 取消註釋以啟用測試
      testConsoleMonitor();
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
      if (!initializeDOM()) {
        console.error("初始化DOM失敗");
        return false;
      }
      // 啟動console監聽程序
      startCoreServices();
      // 啟動開發者模式
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
      if (!startCoreServices()) {
        console.error("核心服務啟動失敗");
        return false;
      }
      initializeDevelopmentMode();

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
