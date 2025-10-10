// src / client / app / app - controller.ts;

import { createUIController } from "@/client/components";
import { createConsoleMonitor } from "@/client/core";
import { testConsoleMonitor } from "../utils";
import logPage from "@assets/template/console-page.html?raw";

/**
 * 應用控制器 - 管理應用的生命週期和狀態
 *
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Application Layer
 *
 * @description
 * 職責：協調各層，管理應用生命週期，不包含具體業務邏輯
 *
 * **主要職責：**
 * - **應用狀態管理**：統一管理整個應用的狀態和生命週期
 * - **模組協調**：作為各個組件（監控器、UI、工具）之間的協調中心
 * - **DOM 初始化**：負責 HTML 模板掛載和基礎 DOM 結構建立
 * - **核心服務啟動**：協調 UI 控制器和核心服務的啟動
 * - **開發模式支援**：提供開發環境下的額外功能和測試
 *
 */

export function appController() {
  let isInitialized = false;
  let isStarted = false;
  let ui: ReturnType<typeof createUIController> | null = null;
  let consoleService: ReturnType<typeof createConsoleMonitor> | null = null;

  const initializeDOM = (): boolean => {
    const app = document.querySelector<HTMLElement>("#pikka-console-web");
    if (!app) {
      return false;
    }
    app.innerHTML = logPage;

    return true;
  };

  const startCoreServices = async (): Promise<boolean> => {
    consoleService ??= createConsoleMonitor();
    await consoleService.start();
    // render跟掛載監聽器
    ui = createUIController();
    await ui.start();
    ui.render();
    if (!ui) {
      return false;
    }
    return true;
  };

  /**
   * @description
   * 在開發模式下啟動額外的日誌和測試
   *
   * @example
   * 在開發模式下，取消註釋以下代碼以啟用測試
   * testConsoleMonitor();
   */
  const initializeDevelopmentMode = (): void => {
    if (import.meta.env.DEV) {
      // console.log("應用已啟動 - 開發模式");
      // 取消註釋以啟用測試
      testConsoleMonitor();
    }
  };

  return {
    initialize(): boolean {
      if (isInitialized) {
        // 代表已經初始化過一次
        return true;
      }

      //初始化應用失敗
      if (!initializeDOM()) {
        return false;
      }

      // 啟動開發者模式
      isInitialized = true;
      return true;
    },
    async bootUp(): Promise<boolean> {
      if (!this.initialize()) {
        // 初始化失敗
        return false;
      }
      if (isStarted) {
        // 已經啟動過一次
        return true;
      }
      const ok = await startCoreServices();
      if (!ok) {
        // 監聽器啟動失敗
        return false;
      }
      initializeDevelopmentMode();

      isStarted = true;
      return true;
    },
    stop(): void {
      consoleService?.cleanUp();
      ui?.stop();
      isStarted = false;
    },
    async restart(): Promise<boolean> {
      this.stop();
      isInitialized = false;
      isStarted = false;
      return this.bootUp();
    },

    getApplicationStatus() {
      return { isInitialized, isStarted };
    },

    isReady(): boolean {
      return isInitialized && isStarted;
    },
  };
}
