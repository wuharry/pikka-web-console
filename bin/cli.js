#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";

console.log("=".repeat(50));
console.log("🎯 初始化 Pikka Console");
console.log("=".repeat(50));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// 命令行參數解析
// process.argv[0] = Node.js 執行檔的路徑
// process.argv[1] = 正在執行的 JavaScript 檔案路徑
// process.argv[2] 開始 = 實際的命令行參數
// npx pikka-console init--->抓init
const args = process.argv.slice(2);

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

/* ------------------------------ dev 啟動 ------------------------------ */
async function startViteServer(port = 3749) {
  const configPath = join(process.cwd(), "pikka-console.config.js");

  if (!existsSync(configPath)) {
    console.error("❌ 找不到 pikka-console.config.js");
    console.log("💡 請先執行: npx pikka-console init");
    process.exit(1);
  }

  try {
    console.log("📋 載入 Vite 配置...");
    const { createServer } = await import("vite");

    // 以動態 import 載入（ESM/CJS 都可，CJS 會在 .default）
    const configUrl = pathToFileURL(configPath).href;
    const mod = await import(configUrl);
    const loaded = (mod?.default ?? mod) || {};
    // 允許 config 為 object 或 function
    const baseConfig =
      typeof loaded === "function"
        ? loaded({ command: "serve", mode: "development" })
        : loaded;

    // 動態覆蓋 server 設定
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
    console.error("❌ Vite 服務器啟動失敗:", error?.message || error);
    console.log("💡 請檢查 pikka-console.config.js 是否合法");
    process.exit(1);
  }
}

/* ------------------------ 寫入 package.json 腳本 ------------------------ */
function addConsoleScriptsToPackageJson(cwd = process.cwd()) {
  // 找 package.json
  const pkgPath = path.join(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    console.error("❌ 找不到 package.json，請在專案根目錄執行！");
    process.exit(1);
  }

  // 讀取並解析
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  // 確保 scripts 存在
  pkg.scripts ||= {};

  pkg.scripts["dev:console"] = "pikka-console dev --port 3749";
  pkg.scripts["console:monitor"] = "pikka-console dev --port 3750";

  if (!pkg.scripts["dev:all"]) {
    const pm = detectPackageManager(cwd);
    pkg.scripts["dev:all"] =
      `concurrently "${pm} run dev" "${pm} run dev:console"`;
    console.log(`💡 建議安裝 concurrently: ${installCmd(pm)} concurrently`);
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  console.log("✅ 已新增 scripts:");
  console.log("   - dev:console      # 啟動 Pikka Console");
  console.log("   - console:monitor  # 備用監控指令");
  console.log("   - dev:all          # 同時啟動原專案和 Console");
}

/* ------------------------ 產生 pikka-console.config.js ------------------------ */
/**
 * 1) 嘗試以 Vite API 載入專案 vite.config（自動找最接近的檔案）
 * 2) 失敗則 fallback 到最小配置
 * 3) 產生 pikka-console.config.js（CJS 格式，import 也可載）
 */
async function createPikkaConsoleConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "pikka-console.config.js");
  if (existsSync(configPath)) {
    console.log("ℹ️ 已存在 pikka-console.config.js，略過建立");
    return configPath;
  }

  console.log("🔍 載入專案的 vite.config 檔案...");
  // ✅ 正確的方式：使用 Vite 的 API 載入配置

  let processedConfig = { plugins: [], resolve: { alias: {} } };

  try {
    // 動態載入 Vite 來讀取配置
    const { loadConfigFromFile } = await import("vite");

    // ✅ 不要把「資料夾路徑」丟進第二參數！
    // 讓 Vite 自行從 cwd 向上尋找，或你可以自己猜常見檔名。
    const found = await loadConfigFromFile({
      command: "serve",
      mode: "development",
    });
    if (found?.config) {
      processedConfig = found.config;
      console.log(`✅ 成功載入 ${found.path}`);
    } else {
      console.log("⚠️ 未找到可用的 vite.config，使用預設配置");
    }
  } catch (error) {
    console.log("⚠️  沒有找到 vite.config，使用預設配置");
    console.log("💀 錯誤原因:", error?.message || error);
  }

  // 建立 Pikka Console 的 Vite 配置（預設 3749）
  const pikkaViteConfig = {
    ...processedConfig,
    server: {
      ...(processedConfig?.server || {}),
      port: 3749,
      host: true,
      // Pikka Console 專用設定
      cors: true,
      open: false, // 由 CLI 控制
    },
    root: cwd,
    mode: "development",
    // 添加 Pikka Console 專用插件
    // 未來可以加入 Pikka 專用插件我目前沒有,
    // '@pikka/console-plugin',
    // '@pikka/dev-tools-plugin'
    plugins: [...(processedConfig?.plugins || [])],
    // 專用的建構設定
    build: {
      ...(processedConfig?.build || {}),
      outDir: "pikka-console-dist",
    },
    // 定義環境變數

    define: {
      ...(processedConfig?.define || {}),
      __PIKKA_CONSOLE__: true,
      __PIKKA_DEV__: true,
    },
  };

  // 寫成 CJS（Node ESM 也能以 import 讀到 default）
  const fileContent = `// Auto-generated by pikka-console
// 🎯 Pikka Console Vite 配置檔案
const { defineConfig } = require('vite');

module.exports = defineConfig(${JSON.stringify(pikkaViteConfig, null, 2)});

// 如果需要動態配置，也可以導出函數：
// 💡 你可以手動編輯這個檔案來自定義 Pikka Console 的行為
// 例如：添加插件、修改 server 設定、調整 build 選項等


// module.exports = defineConfig(({ command, mode }) => (${JSON.stringify(pikkaViteConfig, null, 2)}));
`;
  writeFileSync(configPath, fileContent);

  console.log("✅ 已建立 pikka-console.config.js");
  console.log(`   配置檔案: ${configPath}`);
  console.log("   預設 Port: 3749");
  return configPath;
}

/* -------------------------------- dev 命令 -------------------------------- */
async function devCommand(args) {
  console.log("🚀 Starting Pikka Console...");
  const port = args.includes("--port")
    ? parseInt(args[args.indexOf("--port") + 1]) || 3749
    : 3749;
  // 🎯 關鍵選擇：用 Vite 服務器還是Turbopack dev server(next,目前沒有配置)
  await startViteServer(port);
}

/* -------------------------------- init 命令 ------------------------------- */
async function initCommand() {
  const cwd = process.cwd();
  try {
    addConsoleScriptsToPackageJson(cwd);
    await createPikkaConsoleConfig(cwd);
  } catch (error) {
    console.error("❌ 初始化失敗:", error?.message || error);
    process.exit(1);
  }
}

/* -------------------------------- 顯示版本 -------------------------------- */
function showVersion() {
  const pkgPath = join(__dirname, "../package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    console.log(`pikka-console v${pkg.version}`);
  } else {
    console.log("pikka-console (version unknown)");
  }
}

/* -------------------------------- 顯示說明 -------------------------------- */
function showHelp() {
  console.log("🔍 Pikka Console CLI");
  console.log("\n用法：");
  console.log("  pikka-console init              # 初始化配置");
  console.log("  pikka-console dev               # 啟動開發服務器");
  console.log("  pikka-console dev --port 8080   # 指定端口");
  console.log("  pikka-console version           # 顯示版本");
  console.log("\n範例：");
  console.log("  npx pikka-console init");
  console.log("  npm run dev:console");
  console.log("  npm run dev:all  # 同時啟動原專案 + Console");
}
