// src/client/app/app-controller.ts
import { getConsoleMonitor } from '../core/console-monitor';
import { getConsoleUI } from '../components/console-ui';
import type { ConsoleType } from '../../shared/types/console.types';

export class AppController {
  private consoleMonitor = getConsoleMonitor();
  private consoleUI = getConsoleUI();
  private updateInterval: number | null = null;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.setupEventListeners();
    this.startPeriodicUpdate();
  }

  private setupEventListeners(): void {
    // 監聽 Tab 切換事件
    document.addEventListener('console-tab-change', (event) => {
      const customEvent = event as CustomEvent<{ tabType: ConsoleType }>;
      this.handleTabChange(customEvent.detail.tabType);
    });

    // 監聽窗口卸載事件，清理資源
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });
  }

  private handleTabChange(tabType: ConsoleType): void {
    const monitorData = this.consoleMonitor.getMonitorData();
    this.consoleUI.updateContent(tabType, monitorData);
  }

  private startPeriodicUpdate(): void {
    // 每秒更新一次內容（如果有活躍的 tab）
    this.updateInterval = window.setInterval(() => {
      this.refreshActiveTab();
    }, 1000);
  }

  private refreshActiveTab(): void {
    const activeTab = document.querySelector<HTMLButtonElement>('button[role="tab"].active');
    if (activeTab) {
      const tabType = activeTab.innerText.toLowerCase() as ConsoleType;
      this.handleTabChange(tabType);
    }
  }

  public clearConsole(): void {
    this.consoleMonitor.clear();
    this.refreshActiveTab();
  }

  public destroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    this.consoleMonitor.destroy();
  }
}

// 單例模式導出
let appControllerInstance: AppController | null = null;

export function getAppController(): AppController {
  if (!appControllerInstance) {
    appControllerInstance = new AppController();
  }
  return appControllerInstance;
}

// 便利函數
export function initializeApp(): AppController {
  return getAppController();
}
