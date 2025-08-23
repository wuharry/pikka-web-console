import { consoleMonitor } from "../core";
import type { ConsoleMonitorData } from "../types";
import { createMessageListHtml, escapeHtml } from "../utils/html-utils";

const monitorData = consoleMonitor();
const CONTAINER_CLASS = "console-content max-h-96 overflow-y-auto";

const TAB_CONTENT_MAP = {
  log: (m: ConsoleMonitorData) =>
    `<div class="${CONTAINER_CLASS}">${createMessageListHtml(m.logList, "log", "text-blue-600")}</div>`,
  error: (m: ConsoleMonitorData) =>
    `<div class="${CONTAINER_CLASS}">${createMessageListHtml(Array.from(m.errorSet), "error", "text-red-600")}</div>`,
  warn: (m: ConsoleMonitorData) =>
    `<div class="${CONTAINER_CLASS}">${createMessageListHtml(m.warnList, "warn", "text-yellow-600")}</div>`,
  info: (m: ConsoleMonitorData) =>
    `<div class="${CONTAINER_CLASS}">${createMessageListHtml(m.infoList, "info", "text-green-600")}</div>`,
  all: (m: ConsoleMonitorData) => generateAllMessagesContent(m),
} as const;
const TAB_ACTIVE_CLASSES: Record<keyof typeof TAB_CONTENT_MAP, string> = {
  log: "bg-blue-600",
  error: "bg-red-600",
  warn: "bg-yellow-600",
  info: "bg-green-600",
  all: "bg-slate-700",
};

export function renderTabs() {
  const tabList = document.querySelector<HTMLUListElement>("#tab-links")!;
  const tabs =
    tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');

  const ALL_BG_COLORS = Object.values(TAB_ACTIVE_CLASSES);

  tabs.forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;
      // 移除所有 active 狀態
      tabs.forEach((tab) =>
        tab.classList.remove("active", "text-gray-50", ...ALL_BG_COLORS)
      );

      // 添加 active 狀態到當前 tab
      target.classList.add(
        "active",
        "text-gray-50",
        TAB_ACTIVE_CLASSES[target.innerText as keyof typeof TAB_ACTIVE_CLASSES]
      );

      switchContent(target.innerText.toLowerCase());
    });
  });
}

function switchContent(tabType: string) {
  const content = document.querySelector("#tab-content");
  if (content) {
    content.innerHTML = getTabContent(tabType);
  }
}

function getTabContent(tabType: string): string {
  return TAB_CONTENT_MAP[tabType as keyof typeof TAB_CONTENT_MAP](monitorData);
}

function generateAllMessagesContent(monitorData: ConsoleMonitorData): string {
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
    .map(
      ({ msg, type, color }) => `
        <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
          <span class="text-xs font-bold ${color}">[${type.toUpperCase()}]</span>
          <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
          <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(msg)}</pre>
        </div>
      `
    )
    .join("");

  return `<div class="console-content max-h-96 overflow-y-auto">${messagesHtml}</div>`;
}

// function createMessageList(
//   messages: string[],
//   type: string,
//   colorClass: string
// ) {
//   if (messages.length === 0) {
//     return `<div class="text-gray-500 p-4">No ${type} messages</div>`;
//   }
//   return messages
//     .map(
//       (msg) => `
//         <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
//           <span class="text-xs font-bold ${colorClass}">[${type.toUpperCase()}]</span>
//           <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
//           <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(
//             msg
//           )}</pre>
//         </div>
//       `
//     )
//     .join("");
// }
