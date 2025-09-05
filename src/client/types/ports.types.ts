export type ConsoleLevel = "log" | "info" | "warn" | "error";

export interface SourceMeta {
  tabId: string;
  url: string;
  origin: string;
  userAgent?: string;
}

export interface ConsolePayload {
  level: ConsoleLevel;
  args?: unknown[];
  message: string;
  timestamp: number;
  source: SourceMeta;
}
export interface ErrorPayload {
  // Error 特有的屬性
  name: string; // "TypeError", "ReferenceError" 等
  message: string; // error.message
  stack: string | undefined; // error.stack
  cause?: unknown; // error.cause (ES2022)
  timestamp: number;
  source: SourceMeta;
}
// 控制命令
export type ControlType = "INIT" | "HEARTBEAT" | "CLEAR" | "PAUSE" | "RESUME";
export interface ControlPayload {
  type: ControlType;
  reason?: string;
  source: SourceMeta;
}

// 廣播頻道訊息格式

export type ChannelMessage = ConsolePayload[] | ErrorPayload[];

export interface ConsumerHandle {
  getChannelData: () => StateStore;
  cleanUp: () => void;
}
export interface ConsumerData {
  error: ErrorPayload[];
  info: ConsolePayload[];
  warn: ConsolePayload[];
  log: ConsolePayload[];
}

export interface StateStore {
  error: ErrorPayload[];
  info: ConsolePayload[];
  warn: ConsolePayload[];
  log: ConsolePayload[];
}
