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
import { LEVEL_COLOR_MAP } from "../constants";

const CONTAINER_CLASS = "console-content overflow-y-auto";

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
        colorClass: LEVEL_COLOR_MAP,
      }),
      CONTAINER_CLASS
    ),
  error: (message: ErrorPayload[]) =>
    buildContainer(
      createMessageListHtml({
        messages: message,
        colorClass: LEVEL_COLOR_MAP,
      }),
      CONTAINER_CLASS
    ),
  warn: (message: ConsolePayload[]) =>
    buildContainer(
      createMessageListHtml({
        messages: message,
        colorClass: LEVEL_COLOR_MAP,
      }),
      CONTAINER_CLASS
    ),
  info: (message: ConsolePayload[]) =>
    buildContainer(
      createMessageListHtml({
        messages: message,
        colorClass: LEVEL_COLOR_MAP,
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
  try {
    return TAB_CONTENT_MAP[tabType as "log" | "warn" | "info"](
      consoleData as ConsolePayload[]
    );
  } catch (error) {
    return "";
  }
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
    content.innerHTML = getTabContent({
      tabType: tabType,
      consoleData: consoleData,
    });
  }
};

export function renderTabs(data: StateStore) {
  const tabList = document.querySelector<HTMLUListElement>("#tab-links");
  if (!tabList) {
    return;
  }

  const tabs =
    tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]');
  const ALL_BG_COLORS = Object.values(TAB_ACTIVE_CLASSES);

  // 綁定事件監聽器
  tabs.forEach((button) => {
    //深層複製按鈕
    const newButton = button.cloneNode(true) as HTMLButtonElement;
    if (newButton.dataset.tab) {
      const buttonText = newButton.textContent?.toLowerCase().trim();
      newButton.dataset.tab = buttonText;
    } else {
      newButton.dataset.tab = "all";
    }
    button.parentNode?.replaceChild(newButton, button);

    newButton.addEventListener("click", (e) => {
      const target = e.currentTarget as HTMLButtonElement;

      clearAllTabStats(
        tabList.querySelectorAll<HTMLButtonElement>('button[role="tab"]'),
        ALL_BG_COLORS
      );
      activateTab(target);
      const tabType = target.dataset.tab as TabKey;
      if (!tabType) {
        return;
      }

      const AllData = [...data.error, ...data.info, ...data.warn, ...data.log];

      switchContent({
        tabType: tabType,
        consoleData:
          tabType === "all" ? AllData : data[tabType as keyof StateStore],
      });
    });
  });
}
