// 📁 src/lib/createConsoleServer.js
import { createServer } from "vite";
import path from "path";

export async function createConsoleServer(config) {
  const consoleRoot = path.resolve(".pikka");

  // 確保監控界面有正確的 Vite 配置
  const viteConfig = {
    root: consoleRoot,
    server: {
      port: config.port || 3749,
      host: true,
      open: config.open !== false,
    },
    // 重要：明確指定這是一個標準的 Web 應用
    build: {
      outDir: "dist",
      // 確保正確的入口點
      rollupOptions: {
        input: path.join(consoleRoot, "index.html"),
      },
    },
    // 開發模式設定
    optimizeDeps: {
      include: [], // 不需要預構建任何依賴
    },
  };

  try {
    const server = await createServer(viteConfig);
    await server.listen();

    const address = server.httpServer?.address();
    const port = typeof address === "object" ? address.port : config.port;

    console.log(`\n🎯 Pikka Console 已啟動`);
    console.log(`   ➜  監控界面: \x1b[32mhttp://localhost:${port}\x1b[0m`);
    console.log(
      `   ➜  請確保主應用運行在: \x1b[32mhttp://localhost:5173\x1b[0m`
    );

    return server;
  } catch (error) {
    console.error("❌ 無法啟動監控界面:", error.message);
    throw error;
  }
}

// 📁 src/lib/templates.js
export function createMonitorHTML() {
  // 返回我們剛才創建的 HTML 內容
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pikka Console - 應用監控界面</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

export function createMonitorJS() {
  // 返回我們剛才創建的 JavaScript 內容
  return `import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  initConsole()
})

// ... (完整的 JavaScript 代碼)
`;
}

export function createMonitorCSS() {
  return `/* 監控界面樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
  color: #e2e8f0;
  min-height: 100vh;
  line-height: 1.6;
}

/* ... (完整的 CSS 代碼) */
`;
}

// 📁 src/commands/init.js (修正版)
import fs from "fs/promises";
import path from "path";
import {
  createMonitorHTML,
  createMonitorJS,
  createMonitorCSS,
} from "../lib/templates.js";

export async function initCommand() {
  const pikkaDir = ".pikka";
  const srcDir = path.join(pikkaDir, "src");

  try {
    // 創建目錄結構
    await fs.mkdir(pikkaDir, { recursive: true });
    await fs.mkdir(srcDir, { recursive: true });

    // 創建檔案
    await Promise.all([
      // HTML 入口檔案
      fs.writeFile(path.join(pikkaDir, "index.html"), createMonitorHTML()),

      // JavaScript 主檔案
      fs.writeFile(path.join(srcDir, "main.js"), createMonitorJS()),

      // CSS 樣式檔案
      fs.writeFile(path.join(srcDir, "style.css"), createMonitorCSS()),
    ]);

    console.log("✅ Pikka Console 初始化完成！");
    console.log("\n📁 已創建檔案：");
    console.log("   .pikka/index.html     - 監控界面入口");
    console.log("   .pikka/src/main.js    - 主要邏輯");
    console.log("   .pikka/src/style.css  - 界面樣式");
    console.log("\n🚀 使用方式：");
    console.log("   npm run dev:console   - 啟動監控界面");
    console.log("   npm run dev:all       - 同時啟動主應用和監控界面");
  } catch (error) {
    console.error("❌ 初始化失敗:", error.message);
    throw error;
  }
}
