//src/client/core/main.ts
import { consoleInterceptor } from "@/client/core/console-interceptor";
import { errorCollector } from "@/client/core/error-collector";
import type { ConsoleService, ConsoleDataStore } from "../types/console.types";

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
  const stateStore: ConsoleDataStore = {
    errorSet: new Set<string>(),
    infoList: [],
    warnList: [],
    logList: [],
  };
  const { errorSet, infoList, warnList, logList } = stateStore;

  const { restoreLog: resetConsole } = consoleInterceptor({
    errorSet,
    infoList,
    warnList,
    logList,
  });
  //呼叫的時候就會掛載監聽器了,所以需要手動關閉->stop
  const { stop: stopErrorListener } = errorCollector({ errorSet });

  const cleanUp = () => {
    stopErrorListener();
    resetConsole();
  };

  // 資料存取函式
  const getterStore = (): ConsoleDataStore => ({ ...stateStore });
  const getLog = (): string[] => logList.slice();
  const getError = (): string[] => Array.from(errorSet);
  const getInfo = (): string[] => infoList.slice();
  const getWarn = (): string[] => warnList.slice();
  return {
    cleanUp,
    getterStore,
    getLog,
    getError,
    getInfo,
    getWarn,
  };
}
