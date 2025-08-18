// src/main.ts
import "./style.css";
import { setupTabs } from "./web.ts";
import logPage from "./html/console-page.html?raw";
// import { testConsoleMonitor } from "./console.ts";

window.addEventListener("DOMContentLoaded", () => {
  setupTabs();
});
// testConsoleMonitor();
const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML = logPage;
