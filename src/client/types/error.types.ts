export type JSRuntimeError = {
  type: "js-runtime";
  message: string | Event;
  source?: string;
  line?: number;
  column?: number;
};

export type ResourceError = {
  type: "resource";
  target: HTMLElement | EventTarget;
};

export type UnknownError = {
  type: "unknown";
  data: any;
};
export type ErrorData = JSRuntimeError | ResourceError | UnknownError;
