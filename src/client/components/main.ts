// src/client/components/main.ts
import { renderTabs } from "@/client/components/console-renderer";
import { consumer as createConsumer } from "../core/consumer";

/**
 * UI 控制器 - 管理使用者介面互動和渲染
 *
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Presentation Layer
 *
 * 主要職責：
 * - 服務模組協調：創建和管理 console 監控服務
 * - 渲染器管理：調用 `renderTabs` 進行 UI 渲染
 * - 資源釋放：提供 `stop` 方法停止監聽和釋放資源
 * - 抽象化層級：作為應用控制器和核心服務之間的抽象層
 */

export function createUIController() {
  const messageConsumer = createConsumer("pikka-web-console-channel");
  const render = () => renderTabs(messageConsumer.getChannelData());
  return {
    render,
    stop: messageConsumer.cleanUp, //‼️重要：停止監聽跟釋放資源以及還原log用的
  };
}
