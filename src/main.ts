import "./style.css";
import { setupTabs } from "./web.ts";
import logPage from "./html/console-page.html?raw";

window.addEventListener("DOMContentLoaded", () => {
  setupTabs();
});
const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML = logPage;
