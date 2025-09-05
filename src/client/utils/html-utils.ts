import type {
  ChannelMessage,
  ConsolePayload,
  ErrorPayload,
} from "@/client/types";

/** 視覺層對應：level -> color class */
export const LEVEL_COLOR_MAP: Record<string, string> = {
  log: "text-blue-600",
  warn: "text-yellow-600",
  info: "text-green-600",
  error: "text-red-600",
};

interface UnifiedMessage {
  message: string;
  type: string;
  color: string;
}

/**
 * 安全地轉義 HTML 字符
 * @param text - 要轉義的文本
 * @returns 轉義後的 HTML 安全字符串
 */
export function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 單則訊息 HTML
 * @param message - 消息內容
 * @param type - 消息類型
 * @param colorClass - CSS 顏色類名
 * @returns HTML 字符串
 */
export function createMessageHtml({
  message,
  colorClass,
}: {
  message: ConsolePayload | ErrorPayload;
  colorClass: string;
}): string {
  if ("level" in message) {
    return `
      <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
        <span class="text-xs font-bold ${colorClass}">[${message.level}]</span>
        <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
        <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(message.message)}</pre>
      </div>
    `;
  }
  return `
    <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
      <span class="text-xs font-bold ${colorClass}">[${message.name}]</span>
      <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
      <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(message.message)}</pre>
    </div>
  `;
}

/**
 *  訊息清單 HTML
 * * @param messages - 消息數組
 * @param type - 消息類型
 * @param colorClass - CSS 顏色類名
 * @returns HTML 字符串
 */
export function createMessageListHtml({
  messages,
  colorClass,
}: {
  messages: ChannelMessage | (ConsolePayload | ErrorPayload)[];
  colorClass: string;
}): string {
  if (messages.length === 0) {
    return `<div class="text-gray-500 p-4">No messages</div>`;
  }
  return messages
    .map((msg) => createMessageHtml({ message: msg, colorClass }))
    .join("");
}

/** 容器包一層（由 renderer 提供 className） */
export function buildContainer(innerHtml: string, className: string): string {
  return `<div class="${className}">${innerHtml}</div>`;
}

/** all 分頁的彙整 HTML（純函式） */
export function renderAllMessages({
  messages,
  containerClass = "bg-white border border-gray-200 rounded-lg max-h-96 overflow-y-auto",
}: {
  messages: (ConsolePayload | ErrorPayload)[];
  containerClass: string;
}): string {
  const allMessages = messages
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp);

  if (allMessages.length === 0) {
    return '<div class="text-gray-500 p-4">No messages</div>';
  }

  return `<div class="${containerClass}">
    ${createMessageListHtml({ messages: allMessages })}
  </div>`;
}
