export type ConsoleLevel = "log" | "info" | "warn" | "error";

export interface SourceMeta {
  tabId: string;
  url: string;
  origin: string;
  userAgent?: string;
}

export interface ConsolePayload {
  level: ConsoleLevel;
  args: unknown[];
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

export type ChannelMessage =
  | { kind: "CONSOLE"; data: ConsolePayload }
  | { kind: "CONTROL"; data: ControlPayload }
  | { kind: "BATCH"; data: ConsolePayload[] };

export interface IChannel {
  onMessage(handler: (msg: ChannelMessage) => void): void;
  send(msg: ChannelMessage): void;
  close(): void;
}
