// src/client/components/console-ui.ts
import type { ConsoleMonitorData, ConsoleType } from '../../shared/types/console.types';
import { createMessageListHtml, escapeHtml } from '../utils/html-utils';

interface TabColorConfig {
  [key: string]: string;
}

export class ConsoleUI {
  private tabColorMap: TabColorConfig = {
    Log: "bg-blue-300",
    Error: "bg-red-300",
    Warn: "bg-yellow-300",
    Info: "bg-green-300",
    All: "bg-gray-300",
  };

  private allBgColors = Object.values(this.tabColorMap);

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.setupTabEventListeners();
  }

  private setupTabEventListeners(): void {
    const tabList = document.querySelector<HTMLUListElement>("#tab-links");
    if (!tabList) return;

    const tabs = tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');

    tabs.forEach((button) => {
      button.addEventListener("click", (e) => {
        const target = e.target as HTMLButtonElement;
        this.handleTabClick(target, tabs);
      });
    });
  }

  private handleTabClick(
    target: HTMLButtonElement, 
    allTabs: NodeListOf<HTMLButtonElement>
  ): void {
    // 移除所有 active 狀態
    allTabs.forEach((tab) =>
      tab.classList.remove("active", "text-gray-50", ...this.allBgColors)
    );

    // 添加 active 狀態到當前 tab
    const tabText = target.innerText;
    const colorClass = this.tabColorMap[tabText];
    
    if (colorClass) {
      target.classList.add("active", "text-gray-50", colorClass);
    }

    // 觸發內容切換事件
    const tabType = tabText.toLowerCase() as ConsoleType;
    this.dispatchTabChangeEvent(tabType);
  }

  private dispatchTabChangeEvent(tabType: ConsoleType): void {
    const event = new CustomEvent('console-tab-change', {
      detail: { tabType }
    });
    document.dispatchEvent(event);
  }

  public updateContent(tabType: ConsoleType, monitorData: ConsoleMonitorData): void {
    const content = document.querySelector("#tab-content");
    if (!content) return;

    content.innerHTML = this.generateTabContent(tabType, monitorData);
  }

  private generateTabContent(tabType: ConsoleType, monitorData: ConsoleMonitorData): string {
    const containerClass = "console-content max-h-96 overflow-y-auto";

    switch (tabType) {
      case "log":
        return `<div class="${containerClass}">${createMessageListHtml(
          monitorData.logList,
          "log",
          "text-blue-600"
        )}</div>`;

      case "error":
        return `<div class="${containerClass}">${createMessageListHtml(
          Array.from(monitorData.errorSet),
          "error",
          "text-red-600"
        )}</div>`;

      case "warn":
        return `<div class="${containerClass}">${createMessageListHtml(
          monitorData.warnList,
          "warn",
          "text-yellow-600"
        )}</div>`;

      case "info":
        return `<div class="${containerClass}">${createMessageListHtml(
          monitorData.infoList,
          "info",
          "text-green-600"
        )}</div>`;

      case "all":
        return this.generateAllMessagesContent(monitorData);

      default:
        return "<div class='p-4'>預設內容</div>";
    }
  }

  private generateAllMessagesContent(monitorData: ConsoleMonitorData): string {
    const allMessages = [
      ...Array.from(monitorData.errorSet).map((msg) => ({
        msg,
        type: "error",
        color: "text-red-600",
      })),
      ...monitorData.warnList.map((msg: string) => ({
        msg,
        type: "warn",
        color: "text-yellow-600",
      })),
      ...monitorData.logList.map((msg: string) => ({
        msg,
        type: "log",
        color: "text-blue-600",
      })),
      ...monitorData.infoList.map((msg: string) => ({
        msg,
        type: "info",
        color: "text-green-600",
      })),
    ];

    if (allMessages.length === 0) {
      return '<div class="text-gray-500 p-4">No messages</div>';
    }

    const messagesHtml = allMessages
      .map(({ msg, type, color }) => `
        <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
          <span class="text-xs font-bold ${color}">[${type.toUpperCase()}]</span>
          <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
          <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(msg)}</pre>
        </div>
      `)
      .join("");

    return `<div class="console-content max-h-96 overflow-y-auto">${messagesHtml}</div>`;
  }
}

// 單例模式導出
let consoleUIInstance: ConsoleUI | null = null;

export function getConsoleUI(): ConsoleUI {
  if (!consoleUIInstance) {
    consoleUIInstance = new ConsoleUI();
  }
  return consoleUIInstance;
}
