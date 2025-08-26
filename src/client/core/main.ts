//src/client/core/main.ts
import { consoleInterceptor } from "@/client/core/console-interceptor";
import { errorCollector } from "@/client/core/error-collector";
import type { ConsoleService, ConsoleDataStore } from "../types/console.types";

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
