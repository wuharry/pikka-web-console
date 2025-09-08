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

  let baseConfig = {};
  let hasOriginalConfig = false;

  try {
    // 動態載入 Vite 來讀取配置
    const { loadConfigFromFile } = await import("vite");

    const found = await loadConfigFromFile({
      command: "serve",
      mode: "development",
    });

    if (found?.config) {
      // 只提取可序列化的配置部分
      baseConfig = {
        // 基本配置
        root: found.config.root,
        base: found.config.base,
        mode: found.config.mode,

        // 解析配置（通常是可序列化的）
        resolve: found.config.resolve
          ? {
              alias: found.config.resolve.alias || {},
              extensions: found.config.resolve.extensions,
            }
          : {},

        // CSS 配置
        css: found.config.css,

        // 環境變數定義
        define: found.config.define || {},

        // 伺服器配置的一部分
        server: {
          port: found.config.server?.port,
          host: found.config.server?.host,
          https: found.config.server?.https,
          proxy: found.config.server?.proxy,
        },

        // 建構配置
        build: {
          target: found.config.build?.target,
          outDir: found.config.build?.outDir,
          assetsDir: found.config.build?.assetsDir,
          sourcemap: found.config.build?.sourcemap,
        },
      };

      hasOriginalConfig = true;
      console.log(`✅ 成功載入 ${found.path}`);
    } else {
      console.log("⚠️ 未找到可用的 vite.config，使用預設配置");
    }
  } catch (error) {
    console.log("⚠️ 沒有找到 vite.config，使用預設配置");
    console.log("💀 錯誤原因:", error?.message || error);
  }

  // 生成配置文件內容 - 使用模板而非 JSON.stringify
  const fileContent = `// Auto-generated by pikka-console
// 🎯 Pikka Console Vite 配置檔案
const { defineConfig } = require('vite');

module.exports = defineConfig({
  // 繼承原專案的基本配置
  root: '${cwd}',
  mode: 'development',
  
  // 解析配置
  resolve: {
    alias: ${JSON.stringify(baseConfig.resolve?.alias || {}, null, 4)}
  },
  
  // 開發伺服器配置
  server: {
    port: 3749,
    host: true,
    cors: true,
    open: false,
    // 繼承原專案的代理配置（如果有的話）
    ${baseConfig.server?.proxy ? `proxy: ${JSON.stringify(baseConfig.server.proxy, null, 4)}` : "// proxy: {}"}
  },
  
  // 建構配置
  build: {
    outDir: 'pikka-console-dist',
    sourcemap: ${baseConfig.build?.sourcemap || true}
  },
  
  // 環境變數定義
  define: {
    __PIKKA_CONSOLE__: true,
    __PIKKA_DEV__: true,
    ${Object.entries(baseConfig.define || {})
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(",\n    ")}
  },
  
  // CSS 配置
  ${baseConfig.css ? `css: ${JSON.stringify(baseConfig.css, null, 2)},` : "// css: {},"}
  
  // 插件配置 - 動態載入以避免序列化問題
  plugins: (async () => {
    const plugins = [];
    
    ${
      hasOriginalConfig
        ? `
    // 嘗試載入原專案的插件配置
    try {
      const { loadConfigFromFile } = await import('vite');
      const result = await loadConfigFromFile({
        command: 'serve',
        mode: 'development',
      });
      
      if (result?.config?.plugins) {
        plugins.push(...result.config.plugins);
      }
    } catch (e) {
      console.warn('載入原插件配置失敗:', e.message);
    }
    `
        : `
    // 預設插件配置
    // 如果是 React 專案，可能需要以下插件：
    // const react = await import('@vitejs/plugin-react');
    // plugins.push(react.default());
    `
    }
    
    // 添加 Pikka Console 專用插件（未來擴展）
    // const pikkaPlugin = await import('@pikka/vite-plugin');
    // plugins.push(pikkaPlugin.default());
    
    return plugins;
  })()
});

// 💡 你可以手動編輯這個檔案來自定義 Pikka Console 的行為
// 例如：添加插件、修改 server 設定、調整 build 選項等
`;

  writeFileSync(configPath, fileContent);

  console.log("✅ 已建立 pikka-console.config.js");
  console.log(`   配置檔案: ${configPath}`);
  console.log("   預設 Port: 3749");
  console.log(
    `   ${hasOriginalConfig ? "✅ 已繼承原專案配置" : "⚠️ 使用基本配置"}`
  );

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
