#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
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

    // 載入你創建的配置
    delete require.cache[require.resolve(configPath)]; // 清除快取
    const viteConfig = require(configPath);

    // 動態設定 port（改寫覆蓋配置檔中的設定）
    viteConfig.server = {
      ...viteConfig.server,
      port: port,
      host: true,
      open: true, // 自動開啟瀏覽器
    };

    console.log(`🔥 啟動 Pikka Vite 開發服務器 (port: ${port})...`);
    const server = await createServer(viteConfig);
    await server.listen();

    // Vite 會自動顯示 URL
    server.printUrls();

    console.log("\n💡 Pikka Console 已啟動！");

    // 優雅關閉
    const shutdown = () => {
      console.log("\n⏹️  Stopping Pikka Console...");
      server.close(() => process.exit(0));
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("❌ Vite 服務器啟動失敗:", error.message);
    console.log("💡 嘗試檢查 pikka-console.config.js 是否正確");
    process.exit(1);
  }
}

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

  // 新增或覆蓋
  pkg.scripts["dev:console"] = "pikka-console dev --port 3749";
  pkg.scripts["console:monitor"] = "pikka-console dev --port 3750";

  if (!pkg.scripts["dev:all"]) {
    const pm = detectPackageManager();
    pkg.scripts["dev:all"] =
      `concurrently "${pm} run dev" "${pm} run dev:console"`;
    console.log(`💡 建議安裝 concurrently: ${pm} add -D concurrently`);
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

  console.log("✅ 已新增 scripts:");
  console.log("   - dev:console      # 啟動 Pikka Console");
  console.log("   - console:monitor  # 備用監控指令");
  console.log("   - dev:all          # 同時啟動原專案和 Console");
}

/**
 * 建立 pikka-console.config.js
 * 創建配置檔案,建立 vite.config實例
 * @param cwd 目前工作目錄，預設為 process.cwd()
 * @param processedConfig 預處理過的 Vite 設定
 */

async function createPikkaConsoleConfig(cwd = process.cwd()) {
  const configPath = path.join(cwd, "pikka-console.config.js");

  if (existsSync(configPath)) {
    console.log("ℹ️ 已存在 pikka-console.config.js，略過建立");
    return configPath;
  }
  console.log("🔍 載入專案的 vite.config 檔案...");
  // ✅ 正確的方式：使用 Vite 的 API 載入配置
  let processedConfig = {
    plugins: [],
    resolve: { alias: {} },
  };

  try {
    // 動態載入 Vite 來讀取配置
    const { loadConfigFromFile } = await import("vite");
    const result = await loadConfigFromFile(
      {
        command: "serve",
        mode: "development",
      },
      cwd
    );

    processedConfig = result?.config;
    console.log("✅ 成功載入 vite.config.ts");
  } catch (error) {
    console.log("⚠️  沒有找到 vite.config，使用預設配置");
    console.log("💀 錯誤原因:", error.message);
  }

  // 創建 Pikka Console 專用的 Vite 配置
  const pikkaViteConfig = {
    ...processedConfig,
    server: {
      ...processedConfig.server,
      port: 3749,
      host: true,
      // Pikka Console 專用設定
      cors: true,
      open: false, // CLI 會處理開啟瀏覽器
    },
    root: cwd,
    mode: "development",
    // 添加 Pikka Console 專用插件
    plugins: [
      ...(processedConfig.plugins || []),
      // 未來可以加入 Pikka 專用插件我目前沒有,
      // '@pikka/console-plugin',
      // '@pikka/dev-tools-plugin'
    ],
    // 專用的建構設定
    build: {
      ...processedConfig.build,
      outDir: "pikka-console-dist",
    },
    // 定義環境變數
    define: {
      ...processedConfig.define,
      __PIKKA_CONSOLE__: true,
      __PIKKA_DEV__: true,
    },
  };

  // 生成配置檔案內容
  const fileContent = `// Auto-generated by pikka-console
  // 🎯 Pikka Console Vite 配置檔案
const { defineConfig } = require('vite');

module.exports = defineConfig(${JSON.stringify(pikkaViteConfig, null, 2)});

// 如果需要動態配置，也可以導出函數：
// module.exports = defineConfig(({ command, mode }) => {
//   return ${JSON.stringify(pikkaViteConfig, null, 2)};
// });

// 💡 你可以手動編輯這個檔案來自定義 Pikka Console 的行為
// 例如：添加插件、修改 server 設定、調整 build 選項等
`;

  writeFileSync(configPath, fileContent);

  console.log("✅ 已建立 pikka-console.config.js");
  console.log(`   配置檔案: ${configPath}`);
  console.log("   預設 Port: 3740");
  return configPath;
}

async function devCommand(args) {
  console.log("🚀 Starting Pikka Console...");

  const port = args.includes("--port")
    ? parseInt(args[args.indexOf("--port") + 1]) || 3749
    : 3749;

  // 🎯 關鍵選擇：用 Vite 服務器還是Turbopack dev server
  await startViteServer(port);
}

async function initCommand() {
  const cwd = process.cwd();
  try {
    await addConsoleScriptsToPackageJson(cwd);
    await createPikkaConsoleConfig(cwd);
  } catch (error) {
    if (!cwd) {
      console.log("❌ 工作目錄不存在:", cwd);
    }
    console.error("❌ 初始化失敗:", error.message);
    process.exit(1);
  }
}
function showVersion() {
  const pkgPath = join(__dirname, "../package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    console.log(`pikka-console v${pkg.version}`);
  } else {
    console.log("pikka-console (version unknown)");
  }
}

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
function detectPackageManager(cwd = process.cwd()) {
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(cwd, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(cwd, "bun.lockb"))) return "bun";
  if (existsSync(path.join(cwd, "package-lock.json"))) return "npm";
  return "npm";
}
