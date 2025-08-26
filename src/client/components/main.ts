// src/client/components/main.ts
import { createConsoleInterceptor } from "@/client/core";
import { renderTabs } from "@/client/components/console-renderer";

export function createUIController() {
  const monitorService = createConsoleInterceptor();
  const render = () => renderTabs(monitorService);
  return {
    render,
    stop: monitorService.cleanUp, //‼️重要：停止監聽跟釋放資源以及還原log用的
  };
}
