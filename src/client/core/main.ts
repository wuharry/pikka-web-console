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
 * - **服務統一**：整合 `consoleInterceptor` 和 `errorCollector`createConsoleInterceptor
 * - **資源管理**：提供統一的 `cleanUp` 方法
 * - **數據存取 API**：提供安全的數據取用方法
 */

export function createConsoleMonitor(): ConsoleService {
  // 資料封裝,不讓外部直接操作

  //呼叫的時候就會掛載監聽器了,所以需要手動關閉->stop
  const producer = createProducer("pikka-web-console-channel");
  let started = false; // 私有狀態

  const start = async (): Promise<void> => {
    if (started) {
      return;
    }
    try {
      await producer.init();
      producer.start();
      started = true;
      console.log("✅ [Pikka] Console interceptor 已啟動");
    } catch (error) {
      console.error("❌ [Pikka] Producer 啟動失敗:", error);
      throw error;
    }
  };

  const cleanUp = () => {
    if (!started) return;
    producer.stop();
    started = false;
    console.log("🛑 [Pikka] Producer 已停止");
  };

  return { start, cleanUp };
}
