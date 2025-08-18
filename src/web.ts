import { consoleMonitor } from "./console";

export function setupTabs() {
  const monitorData = consoleMonitor();

  const tabList = document.querySelector<HTMLUListElement>("#tab-links")!;
  const tabs =
    tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');

  const TAB_COLOR_MAP = {
    Log: "bg-blue-300",
    Error: "bg-red-300",
    Warn: "bg-yellow-300",
    Info: "bg-green-300",
    All: "bg-gray-300",
  };
  const ALL_BG_COLORS = Object.values(TAB_COLOR_MAP);

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
        TAB_COLOR_MAP[target.innerText as keyof typeof TAB_COLOR_MAP]
      );

      switchContent(target.innerText.toLowerCase(), monitorData);
    });
  });
}

function switchContent(tabType: string, monitorData: any) {
  const content = document.querySelector("#tab-content");
  if (content) {
    content.innerHTML = getTabContent(tabType, monitorData);
  }
}

function getTabContent(tabType: string, monitorData: any): string {
  const createMessageList = (
    messages: string[],
    type: string,
    colorClass: string
  ) => {
    if (messages.length === 0) {
      return `<div class="text-gray-500 p-4">No ${type} messages</div>`;
    }
    return messages
      .map(
        (msg) => `
        <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
          <span class="text-xs font-bold ${colorClass}">[${type.toUpperCase()}]</span>
          <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
          <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(
            msg
          )}</pre>
        </div>
      `
      )
      .join("");
  };
  switch (tabType) {
    case "log":
      return `<div class="console-content max-h-96 overflow-y-auto">${createMessageList(
        monitorData.logList,
        "log",
        "text-blue-600"
      )}</div>`;
    case "error":
      return `<div class="console-content max-h-96 overflow-y-auto">${createMessageList(
        Array.from(monitorData.errorSet),
        "error",
        "text-red-600"
      )}</div>`;
    case "warn":
      return `<div class="console-content max-h-96 overflow-y-auto">${createMessageList(
        monitorData.warnList,
        "warn",
        "text-yellow-600"
      )}</div>`;
    case "info":
      return `<div class="console-content max-h-96 overflow-y-auto">${createMessageList(
        monitorData.infoList,
        "info",
        "text-green-600"
      )}</div>`;
    case "all":
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

      return `<div class="console-content max-h-96 overflow-y-auto">
        ${allMessages
          .map(
            ({ msg, type, color }) => `
          <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
            <span class="text-xs font-bold ${color}">[${type.toUpperCase()}]</span>
            <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
            <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(
              msg
            )}</pre>
          </div>
        `
          )
          .join("")}
      </div>`;
    default:
      return "<div class='p-4'>預設內容</div>";
  }
}

function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
