export type Level = "log" | "info" | "warn" | "error";
export type Transport = (
  level: Level,
  payload: { message: string; ts: number }
) => void;
