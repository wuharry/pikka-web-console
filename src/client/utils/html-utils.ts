// src/client/utils/html-utils.ts

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
 * 創建帶時間戳的消息 HTML
 * @param message - 消息內容
 * @param type - 消息類型
 * @param colorClass - CSS 顏色類名
 * @returns HTML 字符串
 */
export function createMessageHtml(
  message: string,
  type: string,
  colorClass: string
): string {
  return `
    <div class="console-message border-b border-gray-200 p-2 hover:bg-gray-50">
      <span class="text-xs font-bold ${colorClass}">[${type.toUpperCase()}]</span>
      <span class="text-xs text-gray-400 ml-2">[${new Date().toLocaleTimeString()}]</span>
      <pre class="text-sm font-mono mt-1 whitespace-pre-wrap">${escapeHtml(message)}</pre>
    </div>
  `;
}

/**
 * 創建消息列表的 HTML
 * @param messages - 消息數組
 * @param type - 消息類型
 * @param colorClass - CSS 顏色類名
 * @returns HTML 字符串
 */
export function createMessageListHtml(
  messages: string[],
  type: string,
  colorClass: string
): string {
  if (messages.length === 0) {
    return `<div class="text-gray-500 p-4">No ${type} messages</div>`;
  }

  return messages
    .map((msg) => createMessageHtml(msg, type, colorClass))
    .join("");
}
