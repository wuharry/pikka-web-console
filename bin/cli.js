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

/* ------------------------ ESM 兼容版：產生 pikka-console.config.js ------------------------ */
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

  console.log("🔍 檢查專案配置...");

  // 檢查專案是否為 ESM
  const pkgPath = path.join(cwd, "package.json");
  let isESM = false;

  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      isESM = pkg.type === "module";
      console.log(`📦 專案類型: ${isESM ? "ES Module" : "CommonJS"}`);
    } catch (e) {
      console.log("⚠️ 讀取 package.json 失敗，使用預設設定");
    }
  }

  // 檢查是否有原始的 vite.config
  const possibleConfigs = [
    "vite.config.js",
    "vite.config.ts",
    "vite.config.mjs",
    "vite.config.cjs",
  ];

  let originalConfigFile = null;
  for (const config of possibleConfigs) {
    if (existsSync(path.join(cwd, config))) {
      originalConfigFile = config;
      break;
    }
  }

  // 根據專案類型生成對應的配置文件
  const fileContent = isESM
    ? `// Auto-generated by pikka-console (ESM)
// 🎯 Pikka Console Vite 配置檔案
import { defineConfig, loadConfigFromFile } from 'vite';

export default defineConfig(async ({ command, mode }) => {
  // 基礎配置
  let baseConfig = {
    plugins: [],
    resolve: { alias: {} },
    server: {},
    build: {}
  };

  ${
    originalConfigFile
      ? `
  // 載入原專案配置
  try {
    const result = await loadConfigFromFile({ command, mode });
    if (result?.config) {
      baseConfig = result.config;
      console.log('✅ 已載入原專案 Vite 配置');
    }
  } catch (error) {
    console.warn('⚠️ 載入原專案配置失敗，使用預設配置');
  }
  `
      : `
  // 沒有找到原專案配置，使用預設值
  console.log('ℹ️ 使用預設 Vite 配置');
  `
  }

  // 返回 Pikka Console 專用配置
  return {
    ...baseConfig,
    
    // 覆蓋伺服器設定
    server: {
      ...baseConfig.server,
      port: 3749,
      host: true,
      cors: true,
      open: false
    },
    
    // 專案根目錄
    root: '${cwd}',
    mode: 'development',
    
    // 建構設定
    build: {
      ...baseConfig.build,
      outDir: 'pikka-console-dist'
    },
    
    // 環境變數
    define: {
      ...baseConfig.define,
      __PIKKA_CONSOLE__: true,
      __PIKKA_DEV__: true
    },
    
    // 插件（動態載入，避免序列化問題）
    plugins: [
      ...baseConfig.plugins || [],
      // 未來可以在這裡添加 Pikka Console 專用插件
    ]
  };
});

// 💡 你可以手動編輯這個檔案來自定義 Pikka Console 的行為
`
    : `// Auto-generated by pikka-console (CJS)
// 🎯 Pikka Console Vite 配置檔案
const { defineConfig, loadConfigFromFile } = require('vite');

module.exports = defineConfig(async ({ command, mode }) => {
  // 基礎配置
  let baseConfig = {
    plugins: [],
    resolve: { alias: {} },
    server: {},
    build: {}
  };

  ${
    originalConfigFile
      ? `
  // 載入原專案配置
  try {
    const result = await loadConfigFromFile({ command, mode });
    if (result?.config) {
      baseConfig = result.config;
      console.log('✅ 已載入原專案 Vite 配置');
    }
  } catch (error) {
    console.warn('⚠️ 載入原專案配置失敗，使用預設配置');
  }
  `
      : `
  // 沒有找到原專案配置，使用預設值
  console.log('ℹ️ 使用預設 Vite 配置');
  `
  }

  // 返回 Pikka Console 專用配置
  return {
    ...baseConfig,
    
    // 覆蓋伺服器設定
    server: {
      ...baseConfig.server,
      port: 3749,
      host: true,
      cors: true,
      open: false
    },
    
    // 專案根目錄
    root: '${cwd}',
    mode: 'development',
    
    // 建構設定
    build: {
      ...baseConfig.build,
      outDir: 'pikka-console-dist'
    },
    
    // 環境變數
    define: {
      ...baseConfig.define,
      __PIKKA_CONSOLE__: true,
      __PIKKA_DEV__: true
    },
    
    // 插件（動態載入，避免序列化問題）
    plugins: [
      ...baseConfig.plugins || [],
      // 未來可以在這裡添加 Pikka Console 專用插件
    ]
  };
});

// 💡 你可以手動編輯這個檔案來自定義 Pikka Console 的行為
`;

  writeFileSync(configPath, fileContent);

  console.log("✅ 已建立 pikka-console.config.js");
  console.log(`   配置檔案: ${configPath}`);
  console.log("   預設 Port: 3749");
  console.log(`   格式: ${isESM ? "ES Module" : "CommonJS"}`);
  console.log(
    `   ${originalConfigFile ? "✅ 會動態載入 " + originalConfigFile : "⚠️ 使用基本配置"}`
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
