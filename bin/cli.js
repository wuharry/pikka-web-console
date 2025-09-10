#!/usr/bin/env node
// pikka-console CLI (ESM) - JavaScript version

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import path from "path";

console.log("=".repeat(50));
console.log("🎯 初始化 Pikka Console");
console.log("=".repeat(50));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 命令行參數解析
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

/* ------------------------- 公用：確保資料夾 ------------------------- */
function ensureDir(path) {
  // existsSync(path) → 同步檢查路徑 path 是否已經存在。 如果存在，什麼都不做。
  // mkdirSync(p, { recursive: true }) → 同步建立資料夾。
  // recursive: true 代表「一路往上建到這個路徑為止」。
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

// 檢查專案是否為 ES module
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

// 根據你的專案尋找 console 入口（只允許程式檔，不要 HTML）
function resolveConsoleEntry(cwd = process.cwd()) {
  // 先讀 package.json 自訂
  try {
    const pkg = JSON.parse(
      readFileSync(path.join(cwd, "package.json"), "utf8")
    );
    // 讀 package.json 的自訂欄位
    const custom = pkg?.pikkaConsole?.entry;
    if (custom) {
      // 如果是套件名稱，直接回傳
      if (custom === "pikka-web-console") {
        console.log(`🎯 使用套件預設入口: ${custom}`);
        return custom;
      }

      const abs = path.isAbsolute(custom) ? custom : path.join(cwd, custom);
      if (existsSync(abs)) {
        console.log(`🎯 使用 package.json 指定入口: ${abs}`);
        return abs;
      } else {
        console.warn(`⚠️  指定的入口檔案不存在: ${abs}`);
        console.warn(`⚠️  將使用預設搜尋邏輯...`);
      }
    }
  } catch (error) {
    // Ignore package.json parsing errors
  }

  const candidates = [
    // 1. 優先使用套件（最安全的選項）
    "pikka-web-console",

    // 2. 專門為 pikka-console 建立的檔案（避免與用戶專案衝突）
    path.join(cwd, "src/pikka-console.ts"),
    path.join(cwd, "src/pikka-console.tsx"),
    path.join(cwd, "src/pikka-console.js"),
    path.join(cwd, "src/pikka-console.jsx"),
    path.join(cwd, "src/console/main.ts"),
    path.join(cwd, "src/console/main.tsx"),
    path.join(cwd, "src/console/index.ts"),
    path.join(cwd, "src/console/index.tsx"),

    // 3. 特定的 client/app 路徑（比較不會和一般專案衝突）
    path.join(cwd, "src/client/app/main.ts"),
    path.join(cwd, "src/client/app/main.tsx"),

    // 4. 檢查已安裝的套件檔案
    path.join(cwd, "node_modules/pikka-web-console/dist/index.js"),
    path.join(cwd, "node_modules/pikka-web-console/dist/main.js"),

    // 5. 最後才考慮一般的入口檔案（但要小心！）
    // 注意：這些可能會載入用戶的主專案，應該謹慎使用
    // path.join(cwd, "src/main.ts"),     // ← 移除這些危險的選項
    // path.join(cwd, "src/index.ts"),   // ← 移除這些危險的選項
  ];

  for (const fp of candidates) {
    // 如果是套件名稱，不檢查檔案存在（讓 Vite 處理）
    if (fp === "pikka-web-console") {
      console.log(`🎯 使用套件預設入口: ${fp}`);
      return fp;
    }
    if (existsSync(fp)) {
      console.log(`🎯 找到入口文件: ${fp}`);
      return fp;
    }
  }

  if (existsSync(path.join(cwd, "src"))) {
    try {
      const srcFiles = readdirSync(path.join(cwd, "src"));
      console.log(`📁 src/: ${srcFiles.join(", ")}`);
    } catch (error) {
      // Ignore readdir errors
    }
  }
  return "pikka-web-console"; // 最後回退到套件
}

// ------------------------------ dev 啟動 -------------------------------
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
    const { createServer } = await import("vite");

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

// ------------------------- package.json scripts --------------------------
function addConsoleScriptsToPackageJson(cwd = process.cwd()) {
  const pkgPath = path.join(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    console.error("❌ 找不到 package.json，請在專案根目錄執行！");
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.scripts = pkg.scripts || {};

  // 初始化 pikkaConsole 配置（修正套件名稱）
  if (!pkg.pikkaConsole) {
    pkg.pikkaConsole = {
      // entry: "pikka-web-console", // 使用正確的套件名稱
      entry: "node_modules/pikka-web-console/dist/main.d.ts", // 預設建議路徑
    };
    console.log("💡 已設定使用 pikka-web-console 預設入口");
  }

  // 統一以 3749 埠為主（修正指令名稱）
  pkg.scripts["dev:console"] = "pikka-web-console dev --port 3749";
  pkg.scripts["console:monitor"] = "pikka-web-console dev --port 3750";

  if (!pkg.scripts["dev:all"]) {
    const pm = detectPackageManager(cwd);
    pkg.scripts["dev:all"] =
      `concurrently "${pm} run dev" "${pm} run dev:console"`;
    console.log(`💡 建議安裝 concurrently: ${installCmd(pm)} concurrently`);
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("✅ 已新增 scripts 和配置:");
  console.log("   - pikkaConsole.entry   # Console 入口檔案");
  console.log("   - dev:console          # 啟動 Pikka Console");
  console.log("   - console:monitor      # 備用監控指令");
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
  ensureDir(consoleRoot);

  const entry = resolveConsoleEntry(cwd);
  if (!entry) {
    console.error("❌ 找不到 Console 入口檔。請設定 package.json：");
    console.error('   "pikkaConsole": { "entry": "pikka-web-console" }');
    process.exit(1);
  }

  // 簡化的 HTML，直接載入套件
  const indexHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Pikka Console - Dev Mode</title>
  </head>
  <body>
      <div id="pikka-console-web"></div>
      <script type="module" src="${entry}"></script>
  </body>
</html>`;

  writeFileSync(path.join(consoleRoot, "index.html"), indexHtml);

  const common = `
  root: ${JSON.stringify(consoleRoot)},
  mode: 'development',
  publicDir: false,
  server: {
    port: 3749,
    host: true,
    cors: true,
    open: false,
    fs: { allow: [${JSON.stringify(cwd)}] },
  },
  build: {
    outDir: 'pikka-console-dist',
    emptyOutDir: true,
  },
  define: {
    __PIKKA_CONSOLE__: true,
    __PIKKA_DEV__: true,
  },
  plugins: []
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
  console.log(`   入口: ${entry}`);
  console.log("   預設 Port: 3749");
  return outConfigPath;
}

// ----------------------------- commands -----------------------------------
async function devCommand(args) {
  console.log("🚀 Starting Pikka Console...");
  const portIndex = args.indexOf("--port");
  const port =
    portIndex !== -1 && args[portIndex + 1]
      ? parseInt(args[portIndex + 1]) || 3749
      : 3749;
  await startViteServer(port);
}

/* -------------------------------- init 命令 ------------------------------- */
async function initCommand() {
  const cwd = process.cwd();
  try {
    addConsoleScriptsToPackageJson(cwd);
    await createPikkaConsoleConfig(cwd);
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
  console.log(
    "  pikka-web-console init              # 初始化配置（建立 .pikka/console + config）"
  );
  console.log(
    "  pikka-web-console dev               # 啟動開發服務器（獨立 root）"
  );
  console.log("  pikka-web-console dev --port 8080   # 指定端口");
  console.log("  pikka-web-console version           # 顯示版本");
  console.log("\n範例：");
  console.log("  npx pikka-web-console init");
  console.log("  pnpm run dev:console");
  console.log("  pnpm run dev:all  # 同時啟動原專案 + Console");
}
