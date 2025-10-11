#!/usr/bin/env node
//告訴作業系統這是一個 Node.js 可執行文件

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
// fs 模組：文件系統操作
// readFileSync：同步讀取文件
// writeFileSync：同步寫入文件
// existsSync：檢查文件/目錄是否存在
// mkdirSync：創建目錄

import { fileURLToPath, pathToFileURL } from "url";
// url 模組：處理 URL 和文件路徑轉換（ESM 需要）

import { dirname, join } from "path";
import path from "path";
// path 模組：處理文件路徑

console.log("=".repeat(50));
console.log("🎯 初始化 Pikka Console");
console.log("=".repeat(50));

const __filename = fileURLToPath(import.meta.url);
// import.meta.url：ESM 中獲取當前模組的 URL
// fileURLToPath：將 file:// URL 轉換為系統路徑
const __dirname = dirname(__filename);
// dirname：獲取文件所在目錄

// 命令行參數解析
const args = process.argv.slice(2);
// process.argv[0]：Node.js 執行檔的完整路徑
// process.argv[1]：當前腳本檔案路徑
// process.argv[2]：第一個命令行參數
// process.argv[3]：第二個命令行參數
// EX: {script:'dev':'vite'}--> process.argv[0] = /usr/local/bin/node, process.argv[1] = /path/to/my-cli.js, process.argv[2] = vite
// EX:scripts": { "dev:console": "pikka-web-console dev --port 3749"}-->process.argv[0] = /usr/local/bin/node,process.argv[1] = /path/to/your/pikka-cli.js,
// process.argv[2] = "dev", process.argv[3] = "--port", process.argv[4] = "3749"

// 主要邏輯分發
if (args[0] === "init") {
  await initCommand();
} else if (args[0] === "dev") {
  await devCommand(args);
} else if (
  args[0] === "version" ||
  args[0] === "-v" ||
  args[0] === "--version"
) {
  showVersion();
} else {
  showHelp();
}

/* ------------------------- 公用：偵測套件管理器 ------------------------- */
function detectPackageManager(cwd = process.cwd()) {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(cwd, "bun.lockb"))) return "bun";
  if (existsSync(path.join(cwd, "package-lock.json"))) return "npm";
  return "npm";
}

/* ------------------------- 公用：套件安裝指令提示 ------------------------- */
function installCmd(pm) {
  switch (pm) {
    case "pnpm":
      return "pnpm add -D";
    case "yarn":
      return "yarn add -D";
    case "bun":
      return "bun add -d";
    default:
      return "npm i -D";
  }
}

/* ------------------------- 公用：確保資料夾存在 ------------------------- */
function ensureDir(path) {
  // existsSync(path) → 同步檢查路徑 path 是否已經存在。 如果存在，什麼都不做。
  // mkdirSync(p, { recursive: true }) → 同步建立資料夾。
  // recursive: true 代表「一路往上建到這個路徑為止」。
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

// 檢查專案是否為 ES module ，決定生成 .js 還是 .mjs 配置文件。
function isESModuleProject(cwd = process.cwd()) {
  // process.cwd() 會回傳 目前程式執行時的工作目錄（Current Working Directory）。
  // /Users/test/repo/react-test-repo
  // join加入路徑別名package.json後，回傳 /Users/test/repo/react-test-repo/package.json
  const pkgPath = path.join(cwd, "package.json");
  if (!existsSync(pkgPath)) return false;

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    return pkg.type === "module";
  } catch (error) {
    return false;
  }
}

// 檢查 pikka-web-console 套件是否已安裝
function isPikkaConsoleInstalled(cwd = process.cwd()) {
  // 檢查 node_modules 中是否有 pikka-web-console
  const nodeModulesPath = path.join(cwd, "node_modules", "pikka-web-console");
  if (existsSync(nodeModulesPath)) {
    return true;
  }

  // 檢查 package.json 中的 dependencies
  try {
    const pkg = JSON.parse(
      readFileSync(path.join(cwd, "package.json"), "utf8")
    );
    return !!(
      pkg.dependencies?.["pikka-web-console"] ||
      pkg.devDependencies?.["pikka-web-console"] ||
      pkg.peerDependencies?.["pikka-web-console"]
    );
    // HACK:雙重否定：!! （轉換為布林值）
    // HACK:短路評估：|| （任一條件為真即返回 true）
  } catch (error) {
    return false;
  }
}

// ------------------------------ dev 啟動(核心功能 - 開發服務器)-------------------------------
async function startViteServer(port = 3749) {
  const cwd = process.cwd();
  const isESModule = isESModuleProject(cwd);
  const configPath = join(
    cwd,
    isESModule ? "pikka-console.config.mjs" : "pikka-console.config.js"
  );

  if (!existsSync(configPath)) {
    console.error(`❌ 找不到 ${path.basename(configPath)}`);
    console.log("💡 請先執行: npx pikka-web-console init");
    process.exit(1);
  }

  try {
    console.log("📋 載入 Vite 配置...");
    const { createServer } = await import("vite"); //動態導入 Vite：await import("vite")

    // ESM 動態 import
    const mod = await import(pathToFileURL(configPath).href);
    const loaded = (mod?.default ?? mod) || {};
    const baseConfig =
      typeof loaded === "function"
        ? await loaded({ command: "serve", mode: "development" })
        : loaded;

    const viteConfig = {
      ...baseConfig,
      server: {
        ...(baseConfig?.server || {}),
        port,
        host: true,
        open: true,
      },
    };

    console.log(`🔥 啟動 Pikka Vite 開發服務器 (port: ${port})...`);

    const server = await createServer(viteConfig);
    await server.listen();

    // Vite 會自動顯示 URL
    server.printUrls();
    console.log("\n💡 Pikka Console 已啟動！");

    const shutdown = () => {
      console.log("\n⏹️  Stopping Pikka Console...");
      server.close().then(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Vite 服務器啟動失敗:", errorMessage);
    console.log(`💡 請檢查 ${path.basename(configPath)} 是否合法`);
    process.exit(1);
  }
}

async function startApiServer(port = 8992) {
  // 後端的啟用不需要像前端那樣複雜
  try {
    console.log(`🔥 嘗試啟動 Pikka API 服務器 (port: ${port})...`);
    const serverModule = await import("pikka-web-console/server");
    const { honoWebSocketServer } = serverModule;
    if (!honoWebSocketServer) {
      console.error("❌ 找不到啟動 API 服務器的 主程式 ");
      console.error("可用的 exports:", Object.keys(serverModule));
      process.exit(1);
    }
    // const { server } = honoWebSocketServer({ port });
    honoWebSocketServer({ port });
    console.log(`✅ Pikka API 已啟動在 http://localhost:${port}`);
    // return { server };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ API 服務器啟動失敗:", errorMessage);
    process.exit(1);
  }
}
// ------------------------- package.json scripts --------------------------
function addConsoleScriptsToPackageJson(cwd = process.cwd()) {
  const pkgPath = path.join(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    console.error("❌ 找不到 package.json，請在專案根目錄執行！");
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.scripts = pkg.scripts || {};

  // 永遠使用套件名稱作為入口，不要使用專案的檔案
  if (!pkg.pikkaConsole) {
    pkg.pikkaConsole = {
      entry: "pikka-web-console", // 固定使用套件入口
    };
    console.log("💡 已設定使用 pikka-web-console 套件入口");
  } else if (pkg.pikkaConsole.entry !== "pikka-web-console") {
    // 如果已存在但不是套件入口，修正它
    console.warn(`⚠️  偵測到錯誤的入口設定: ${pkg.pikkaConsole.entry}`);
    pkg.pikkaConsole.entry = "pikka-web-console";
    console.log("✅ 已修正為使用 pikka-web-console 套件入口");
  }

  // 統一以 3749 埠為主
  pkg.scripts["dev:console"] = "pikka-web-console dev --port 3749";
  pkg.scripts["dev:backend"] = "pikka-web-console dev --port 8992";
  pkg.scripts["console:monitor"] = "pikka-web-console dev --port 3750";
  const expectedDevAll = `concurrently "${pm} run dev" "${pm} run dev:console" "${pm} run dev:backend"`;

  if (!pkg.scripts["dev:all"]) {
    pkg.scripts["dev:all"] = expectedDevAll;
    const pm = detectPackageManager(cwd);
    console.log(`💡 建議安裝 concurrently: ${installCmd(pm)} concurrently`);
  } else if (pkg.scripts["dev:all"] !== expectedDevAll) {
    // ✅ 如果存在但內容不對，更新它
    console.warn(`⚠️  偵測到舊版 dev:all script，正在更新...`);
    pkg.scripts["dev:all"] = expectedDevAll;
    console.log(`✅ 已更新 dev:all script (包含後端)`);
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("✅ 已新增 scripts 和配置:");
  console.log("   - pikkaConsole.entry = 'pikka-web-console'");
  console.log("   - dev:console          # 啟動 Pikka Console (port 3749)");
  console.log("   - console:monitor      # 備用監控指令 (port 3750)");
  console.log("   - dev:all              # 同時啟動原專案和 Console");
}

/* ------------------------ 產生 pikka-console.config ------------------------ */
async function createPikkaConsoleConfig(cwd = process.cwd()) {
  const isESModule = isESModuleProject(cwd);
  const configFileName = isESModule
    ? "pikka-console.config.mjs"
    : "pikka-console.config.js";
  const outConfigPath = path.join(cwd, configFileName);

  if (existsSync(outConfigPath)) {
    console.log(`ℹ️ 已存在 ${configFileName}，略過建立`);
    return outConfigPath;
  }

  console.log("🔍 準備 Pikka Console 獨立 root...");
  const consoleRoot = path.join(cwd, ".pikka", "console");
  // consoleRoot是.pikka/console這個資料夾作用是把工具所需的 HTML、入口檔、暫存檔、快取、執行根目錄…隔離出來。
  ensureDir(consoleRoot);

  // 永遠使用套件入口
  const entry = "pikka-web-console";

  // 檢查套件是否已安裝
  if (!isPikkaConsoleInstalled(cwd)) {
    console.warn("⚠️  尚未安裝 pikka-web-console 套件");
    console.warn(
      `⚠️  請執行: ${installCmd(detectPackageManager(cwd))} pikka-web-console`
    );
  }

  // 建立橋接的 main.js 檔案--->文件的作用是載入 pikka-web-console 套件
  const mainJsContent = `// Pikka Console 橋接入口檔案
console.log('🎯 載入 Pikka Console...');

// 載入 pikka-web-console 套件和樣式
try {
  // 載入套件
  await import('pikka-web-console');
  
  // 明確載入 CSS
  // 方法 1：嘗試 import CSS（Vite 會處理）
  try {
    await import('pikka-web-console/dist/inpage-console.css');
    console.log('✅ CSS 透過 import 載入成功');
  } catch (cssErr) {
    // 方法 2：如果 import 失敗，使用 link 標籤
    console.log('⚠️ CSS import 失敗，嘗試使用 link 標籤...');
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/node_modules/pikka-web-console/dist/inpage-console.css';
    link.onload = () => console.log('✅ CSS 透過 link 標籤載入成功');
    link.onerror = () => console.error('❌ CSS 載入失敗');
    document.head.appendChild(link);
  }
  
  console.log('✅ Pikka Console 載入完成！');
} catch (error) {
  console.error('❌ 載入 Pikka Console 失敗:', error);
  
  // 顯示錯誤資訊和建議
  const errorDiv = document.createElement('div');
  errorDiv.innerHTML = \`
    <div style="padding: 20px; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 20px; color: #c33;">
      <h3>⚠️ Pikka Console 載入失敗</h3>
      <p><strong>錯誤訊息:</strong> \${error.message}</p>
      <p><strong>可能原因:</strong></p>
      <ul>
        <li>pikka-web-console 套件未正確安裝</li>
        <li>套件版本不相容</li>
        <li>模組解析錯誤</li>
      </ul>
      <p><strong>建議解決方案:</strong></p>
      <ol>
        <li>確認已安裝套件: <code>${installCmd(detectPackageManager(cwd))} pikka-web-console</code></li>
        <li>重新初始化: <code>npx pikka-web-console init</code></li>
        <li>檢查 node_modules 資料夾是否存在</li>
        <li>嘗試清除快取並重新安裝: <code>rm -rf node_modules && ${detectPackageManager(cwd)} install</code></li>
      </ol>
    </div>
  \`;
  document.body.appendChild(errorDiv);
  
  // 拋出錯誤讓開發者知道
  throw error;
}
`;

  writeFileSync(path.join(consoleRoot, "main.js"), mainJsContent);

  // 簡化的 HTML，載入橋接檔案, index.html（控制台頁面）
  const indexHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Pikka Console - Dev Mode</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #1a1a1a;
        color: #fff;
      }
      #pikka-console-web {
        width: 100vw;
        height: 100vh;
      }
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
        flex-direction: column;
      }
      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #333;
        border-top: 4px solid #00d4ff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    </style>
  </head>
  <body>
    <div id="pikka-console-web">
      <div class="loading">
        <div class="spinner"></div>
        <p>🎯 載入 Pikka Console...</p>
      </div>
    </div>
    <script type="module" src="/main.js"></script>
  </body>
</html>`;

  writeFileSync(path.join(consoleRoot, "index.html"), indexHtml);

  // 修正 Vite 配置，確保 publicDir 設定正確
  const common = `
  root: ${JSON.stringify(consoleRoot)},
  mode: 'development',
  publicDir: false,  // 不使用 public 資料夾
  server: {
    port: 3749,
    host: true,
    cors: true,
    open: false,
    fs: { 
      allow: [
        ${JSON.stringify(cwd)},
        ${JSON.stringify(path.join(cwd, "node_modules"))},
        ${JSON.stringify(consoleRoot)}
      ] 
    },
  },
  build: {
    outDir: 'pikka-console-dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: ${JSON.stringify(path.join(consoleRoot, "index.html"))}
      }
    }
  },
  define: {
    __PIKKA_CONSOLE__: true,
    __PIKKA_DEV__: true,
  },
  plugins: [],
  resolve: {
    alias: {
      '@': ${JSON.stringify(cwd)},
      'pikka-web-console': ${JSON.stringify(path.join(cwd, "node_modules/pikka-web-console"))}
    }
  },
  optimizeDeps: {
    include: ['pikka-web-console'],
    exclude: []
  }
`;

  const fileContent = isESModule
    ? `// Auto-generated by pikka-web-console (isolated root) - ESM
import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => ({${common}
}));
`
    : `// Auto-generated by pikka-web-console (isolated root) - CJS
const { defineConfig } = require('vite');

module.exports = defineConfig(({ command, mode }) => ({${common}
}));
`;

  writeFileSync(outConfigPath, fileContent);

  console.log(`✅ 已建立 ${configFileName}`);
  console.log(`   root: ${consoleRoot}`);
  console.log(`   入口: pikka-web-console (套件)`);
  console.log("   預設 Port: 3749");
  return outConfigPath;
}

// 讀取旗標值的公用函式
function readFlag(args, flagName, defaultValue) {
  const index = args.indexOf(flagName);
  if (index !== -1 && args[index + 1]) {
    const value = args[index + 1];
    return isNaN(value) ? defaultValue : parseInt(value) || defaultValue;
  }
  return defaultValue;
}
// ----------------------------- commands -----------------------------------
async function devCommand(args) {
  const isBoth = args.includes("--both");
  const uiPort = readFlag(args, "--ui-port", 3749);
  const apiPort = readFlag(args, "--api-port", 8992);

  // 向後相容：原本的 --port 旗標
  const legacyPort = readFlag(args, "--port", 3749);
  const finalUiPort = args.includes("--ui-port") ? uiPort : legacyPort;

  if (isBoth) {
    console.log("🚀 同時啟動 Pikka Console 前端和後端...");
    console.log(`   前端 (Vite): http://localhost:${finalUiPort}`);
    console.log(`   後端 (API):  http://localhost:${apiPort}`);

    // 這裡你需要實作 startApiServer - 先註解掉
    await Promise.all([startApiServer(apiPort), startViteServer(finalUiPort)]);

    // 暫時先只啟動前端，等你實作好 startApiServer 再打開
    console.log("⚠️  目前只啟動前端，後端功能開發中...");
    await startViteServer(finalUiPort);
  } else {
    console.log("🚀 啟動 Pikka Console 前端...");
    await startViteServer(finalUiPort);
  }
}
/* -------------------------------- init 命令 ------------------------------- */
async function initCommand() {
  const cwd = process.cwd();

  // 先檢查套件是否已安裝
  if (!isPikkaConsoleInstalled(cwd)) {
    const pm = detectPackageManager(cwd);
    console.warn("⚠️  尚未安裝 pikka-web-console 套件");
    console.log(`📦 請先執行: ${installCmd(pm)} pikka-web-console`);
    console.log("   然後再執行: npx pikka-web-console init");
    process.exit(1);
  }

  try {
    addConsoleScriptsToPackageJson(cwd);
    await createPikkaConsoleConfig(cwd);

    console.log("\n🎉 初始化完成！");
    console.log("\n下一步:");
    console.log("1. 啟動 Console: pnpm run dev:console");
    console.log("2. 同時啟動專案和 Console: pnpm run dev:all");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ 初始化失敗:", errorMessage);
    process.exit(1);
  }
}

/* -------------------------------- 顯示版本 -------------------------------- */
function showVersion() {
  const pkgPath = join(__dirname, "../package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      console.log(`pikka-web-console v${pkg.version}`);
    } catch (error) {
      console.log("pikka-web-console (version unknown)");
    }
  } else {
    console.log("pikka-web-console (version unknown)");
  }
}

/* -------------------------------- 顯示說明 -------------------------------- */
function showHelp() {
  console.log("🔍 Pikka Console CLI");
  console.log("\n用法：");
  console.log("  pikka-web-console init                    # 初始化配置");
  console.log(
    "  pikka-web-console dev                     # 只啟動前端 (預設 3749)"
  );
  console.log("  pikka-web-console dev --port 8080         # 指定前端端口");
  console.log("  pikka-web-console dev --both              # 同時啟動前後端");
  console.log("  pikka-web-console dev --both --ui-port 3749 --api-port 8992");
  console.log("  pikka-web-console version                 # 顯示版本");
  console.log("\n範例：");
  console.log("  npx pikka-web-console init");
  console.log("  pnpm run dev:console                      # 只前端");
  console.log("  pikka-web-console dev --both              # 前後端一起");
  console.log("\n端口說明：");
  console.log("  --port      設定前端端口 (向後相容)");
  console.log("  --ui-port   設定前端端口 (明確指定)");
  console.log("  --api-port  設定後端端口 (配合 --both)");
  console.log("  --both      同時啟動前端和後端服務");
}
