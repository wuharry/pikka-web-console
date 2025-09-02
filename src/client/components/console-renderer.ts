// src/client/components/console-renderer.ts
import type { ErrorPayload, ConsolePayload } from "../types";
import { createMessageListHtml, escapeHtml } from "@/client/utils/html-utils";

const CONTAINER_CLASS = "console-content max-h-96 overflow-y-auto";
const TAB_CONTENT_MAP = {
  log: (m: ConsolePayload) =>
    `<div class="${CONTAINER_CLASS}">${createMessageListHtml(m.message, "log", "text-blue-600")}</div>`,
  error: (m: ErrorPayload) =>
    `<div class="${CONTAINER_CLASS}">${createMessageListHtml(Array.from(m.errorSet), "error", "text-red-600")}</div>`,
  warn: (m: ConsolePayload) =>
    `<div class="${CONTAINER_CLASS}">${createMessageListHtml(m.warnList, "warn", "text-yellow-600")}</div>`,
  info: (m: ConsolePayload) =>
    `<div class="${CONTAINER_CLASS}">${createMessageListHtml(m.infoList, "info", "text-green-600")}</div>`,
  all: (m: unknown) => renderAllMessages(m),
} as const;
const TAB_ACTIVE_CLASSES: Record<keyof typeof TAB_CONTENT_MAP, string> = {
  log: "bg-blue-600",
  error: "bg-red-600",
  warn: "bg-yellow-600",
  info: "bg-green-600",
  all: "bg-slate-700",
};

function renderAllMessages(): string {
  const allMessages = [
    ...Array.from(monitorData.errorSet).map((message) => ({
      message,
      type: "error",
      color: "text-red-600",
    })),
    ...monitorData.warnList.map((message: string) => ({
      message,
      type: "warn",
      color: "text-yellow-600",
    })),
    ...monitorData.logList.map((message: string) => ({
      message,
      type: "log",
      color: "text-blue-600",
    })),
    ...monitorData.infoList.map((message: string) => ({
      message,
      type: "info",
      color: "text-green-600",
    })),
  ];

  if (allMessages.length === 0) {
    return '<div class="text-gray-500 p-4">No messages</div>';
  }

  const messagesHtml = allMessages
    .map(
      ({ message, type, color }) => `
        <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
          <span class="text-xs font-bold ${color}">[${type.toUpperCase()}]</span>
          <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
          <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(message)}</pre>
        </div>
      `
    )
    .join("");

  return `<div class="console-content max-h-96 overflow-y-auto">${messagesHtml}</div>`;
}

const clearAllTabStats = (
  tabs: NodeListOf<HTMLButtonElement>,
  bgColors: string[]
) => {
  tabs.forEach((tab) =>
    tab.classList.remove("active", "text-gray-50", ...bgColors)
  );
};

// const clearAllTabContent = () => {
//   const content = document.querySelector("#tab-content");
//   if (content) {
//     content.innerHTML = "";
//   }
// };

const activateTab = (tab: HTMLButtonElement) => {
  const tabType = tab.innerText as keyof typeof TAB_ACTIVE_CLASSES;
  tab.classList.add("active", "text-gray-50", TAB_ACTIVE_CLASSES[tabType]);
};

const getTabContent = ({
  tabType,
  consoleData,
}: {
  tabType: string;
  consoleData: ConsoleDataStore;
}): string => {
  return TAB_CONTENT_MAP[tabType as keyof typeof TAB_CONTENT_MAP](consoleData);
};

const switchContent = ({
  tabType,
  consoleData,
}: {
  tabType: string;
  consoleData: ConsoleDataStore;
}) => {
  const content = document.querySelector("#tab-content");
  if (content) {
    content.innerHTML = getTabContent({
      tabType,
      consoleData,
    });
  }
};

export function renderTabs(monitor: ConsoleService) {
  const consoleData = monitor.getterStore();
  const tabList = document.querySelector<HTMLUListElement>("#tab-links")!;
  const tabs =
    tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');

  const ALL_BG_COLORS = Object.values(TAB_ACTIVE_CLASSES);

  tabs.forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;

      // 移除所有 tab 的 active 狀態
      clearAllTabStats(tabs, ALL_BG_COLORS);

      // 移除所有 tab 的 content
      // clearAllTabContent();

      // 添加 active 狀態到當前 tab
      activateTab(target);

      switchContent({ tabType: target.innerText.toLowerCase(), consoleData });
    });
  });
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
