// src/client/components/console-renderer.ts
import type {
  ErrorPayload,
  ConsolePayload,
  ChannelMessage,
  StateStore,
} from "../types";
import {
  createMessageListHtml,
  renderAllMessages,
  buildContainer,
} from "@/client/utils/html-utils";

const CONTAINER_CLASS = "console-content max-h-96 overflow-y-auto";

const TAB_ACTIVE_CLASSES = {
  log: "bg-blue-600",
  error: "bg-red-600",
  warn: "bg-yellow-600",
  info: "bg-green-600",
  all: "bg-slate-700",
} as const;

const TAB_CONTENT_MAP = {
  log: (message: ConsolePayload[]) =>
    buildContainer(
      createMessageListHtml({
        messages: message,
        colorClass: { class: "!text-blue-300" },
      }),
      CONTAINER_CLASS
    ),
  error: (message: ErrorPayload[]) =>
    buildContainer(
      createMessageListHtml({
        messages: message,
        colorClass: { class: "!text-red-400" },
      }),
      CONTAINER_CLASS
    ),
  warn: (message: ConsolePayload[]) =>
    buildContainer(
      createMessageListHtml({
        messages: message,
        colorClass: { class: "!text-yellow-300" },
      }),
      CONTAINER_CLASS
    ),
  info: (message: ConsolePayload[]) =>
    buildContainer(
      createMessageListHtml({
        messages: message,
        colorClass: { class: "!text-green-300" },
      }),
      CONTAINER_CLASS
    ),
  all: (message: (ConsolePayload | ErrorPayload)[]) =>
    renderAllMessages({ messages: message, containerClass: CONTAINER_CLASS }),
} as const;

type TabKey = keyof typeof TAB_CONTENT_MAP;

const clearAllTabStats = (
  tabs: NodeListOf<HTMLButtonElement>,
  bgColors: string[]
) => {
  tabs.forEach((tab) =>
    tab.classList.remove("active", "text-gray-50", ...bgColors)
  );
};

const activateTab = (tab: HTMLButtonElement) => {
  const tabType = (tab.dataset.tab as TabKey) || "all";
  tab.classList.add("active", "text-gray-50", TAB_ACTIVE_CLASSES[tabType]);
};

const getTabContent = ({
  tabType,
  consoleData,
}: {
  tabType: TabKey;
  consoleData: ChannelMessage | (ConsolePayload | ErrorPayload)[];
}): string => {
  if (tabType === "all") {
    return TAB_CONTENT_MAP.all(consoleData);
  }
  if (tabType === "error") {
    return TAB_CONTENT_MAP.error(consoleData as ErrorPayload[]);
  }
  return TAB_CONTENT_MAP[tabType](consoleData as ConsolePayload[]);
};

const switchContent = ({
  tabType,
  consoleData,
}: {
  tabType: TabKey;
  consoleData: ChannelMessage | (ConsolePayload | ErrorPayload)[];
}) => {
  const content = document.querySelector("#tab-content");
  if (content) {
    content.innerHTML = getTabContent({ tabType, consoleData });
  }
};

// 🚀 追加：初始化預設顯示內容
const initializeDefaultTab = (data: StateStore) => {
  const AllData = [...data.error, ...data.info, ...data.warn, ...data.log];

  // 預設顯示 "all" tab 的內容
  switchContent({
    tabType: "all",
    consoleData: AllData,
  });

  // 預設啟用 "all" tab 的樣式
  const tabList = document.querySelector<HTMLUListElement>("#tab-links");
  if (tabList) {
    const allTab = tabList.querySelector<HTMLButtonElement>('[data-tab="all"]');
    if (allTab) {
      const tabs =
        tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
      const ALL_BG_COLORS = Object.values(TAB_ACTIVE_CLASSES);
      clearAllTabStats(tabs, ALL_BG_COLORS);
      activateTab(allTab);
    }
  }
};

export function renderTabs(data: StateStore) {
  // console.log("renderTabs 被調用，資料:", data); // 🐛 調試用

  const tabList = document.querySelector<HTMLUListElement>("#tab-links");
  if (!tabList) {
    // console.error("找不到 #tab-links 元素");
    return;
  }

  const tabs =
    tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
  const ALL_BG_COLORS = Object.values(TAB_ACTIVE_CLASSES);

  // 🚀 初始化預設顯示內容
  initializeDefaultTab(data);

  // 綁定事件監聽器
  tabs.forEach((button) => {
    // 🚀 移除舊的事件監聽器，避免重複綁定
    const newButton = button.cloneNode(true) as HTMLButtonElement;
    button.parentNode?.replaceChild(newButton, button);

    newButton.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLButtonElement;

      clearAllTabStats(
        tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]'),
        ALL_BG_COLORS
      );
      activateTab(target);

      const tabType = (target.dataset.tab as TabKey) || "all";
      const AllData = [...data.error, ...data.info, ...data.warn, ...data.log];
      switchContent({
        tabType,
        consoleData:
          tabType === "all" ? AllData : data[tabType as keyof StateStore],
      });
    });
  });
}
