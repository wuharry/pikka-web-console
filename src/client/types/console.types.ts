// src/client/types/console-monitor-types.ts
export type Level = "log" | "info" | "warn" | "error";
export type Transport = (
  level: Level,
  payload: { message: string; ts: number }
) => void;

// 每個欄位都必要的MOD,給main等主程式->匯出的資料集->給renderTab用
export interface ConsoleDataStore {
  errorSet: Set<string>;
  infoList: string[];
  warnList: string[];
  logList: string[];
}

// 上面那版的靈活版本
export interface PartialConsoleDataStore {
  errorSet?: Set<string>;
  infoList?: string[];
  warnList?: string[];
  logList?: string[];
}

//core 的匯出屬性接口
export interface ConsoleService {
  cleanUp(): void;

  // 數據訪問
  getterStore(): ConsoleDataStore;
  getLog(): string[];
  getError(): string[];
  getInfo(): string[];
  getWarn(): string[];
}
