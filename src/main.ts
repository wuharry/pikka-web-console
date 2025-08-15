import "./style.css";
import { setupTabs } from "./console.ts";
import logPage from "./html/console-page.html?raw";

const app = document.querySelector<HTMLElement>("#app")!;
app.innerHTML = logPage;
setupTabs();
