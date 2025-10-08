//src/client/core/main.ts
import { producer as createProducer } from "./producer";
import type { ConsoleService } from "@/client/types";

/**
 * 核心服務層 - 提供 console 攔截和錯誤收集服務
 *
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Service Layer
 * 職責：數據封裝、核心業務邏輯、服務統一
 * - **數據狀態管理**：封裝 `ConsoleDataStore`，不讓外部直接操作
 * - **服務統一**：整合 `consoleInterceptor` 和 `errorCollector`
 * - **資源管理**：提供統一的 `cleanUp` 方法
 * - **數據存取 API**：提供安全的數據取用方法
 */

export function createConsoleInterceptor(): ConsoleService {
  // 資料封裝,不讓外部直接操作

  //呼叫的時候就會掛載監聽器了,所以需要手動關閉->stop
  const producer = createProducer("pikka-web-console-channel");
  const start = () => {
    producer.init();
    producer.start();
  };
  const cleanUp = () => {
    producer.stop();
  };

  // 資料存取函式

  return {
    start,
    cleanUp,
  };
}
