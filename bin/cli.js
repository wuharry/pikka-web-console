#!/usr/bin/env node
// pikka-console CLI (ESM) - fixed & integrated

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
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
function ensureDir(p) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

// 根據你的專案尋找 console 入口：先抓 <repo>/src/main.ts，再抓安裝版本
function resolveConsoleEntry(cwd = process.cwd()) {
  const candidates = [
    path.join(cwd, "src/main.ts"),
    path.join(cwd, "src/mian.ts"), // 你貼的路徑有打成 mian.ts，保險也試著找一下
    path.join(cwd, "node_modules/pikka-web-console/dist/main.js"),
  ];
  for (const fp of candidates) {
    if (existsSync(fp)) return fp;
  }
  return null;
}

// ------------------------------ dev 啟動 -------------------------------
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

    // ESM 動態 import（CJS 檔案也能以 default 形式載入）
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
    console.error("❌ Vite 服務器啟動失敗:", error?.message || error);
    console.log("💡 請檢查 pikka-console.config.js 是否合法");
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
  pkg.scripts ||= {};

  // 統一以 3749 埠為主
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
  const outConfigPath = path.join(cwd, "pikka-console.config.js");
  if (existsSync(outConfigPath)) {
    console.log("ℹ️ 已存在 pikka-console.config.js，略過建立");
    return outConfigPath;
  }

  console.log("🔍 準備 Pikka Console 獨立 root...");
  const consoleRoot = path.join(cwd, ".pikka", "console");
  ensureDir(consoleRoot);

  // 解析你的 Console 入口
  const entry = resolveConsoleEntry(cwd);
  if (!entry) {
    console.error("❌ 找不到 Console 入口檔。請確認下列其一存在：");
    console.error("   - <專案>/src/main.ts（或你實際的入口路徑）");
    console.error("   - <專案>/node_modules/pikka-web-console/dist/main.js");
    process.exit(1);
  }

  // 生成 .pikka/console/index.html，包含 #pikka-console-web 並 import 入口
  const entryUrlForVite = entry.startsWith(cwd)
    ? "/" + path.posix.join(...path.relative(cwd, entry).split(path.sep))
    : pathToFileURL(entry).href;

  const indexHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"/>
    <title>Pikka Console</title>
  </head>
  <body>
    <div id="pikka-console-web"></div>
    <script type="module">
      import "${entryUrlForVite}";
    </script>
  </body>
</html>`;
  const indexPath = path.join(consoleRoot, "index.html");
  writeFileSync(indexPath, indexHtml);

  // 產生最小 Vite 設定（獨立於主專案；允許讀取入口所在目錄）
  const allowDirs = JSON.stringify([cwd, path.dirname(entry)]);
  const fileContent = `// Auto-generated by pikka-console (isolated root)
// 🎯 Pikka Console Vite 配置檔案（獨立於主專案）
const { defineConfig } = require('vite');

module.exports = defineConfig(({ command, mode }) => ({
  root: ${JSON.stringify(consoleRoot)},
  mode: 'development',
  publicDir: false,
  server: {
    port: 3749,
    host: true,
    cors: true,
    open: false,
    fs: { allow: ${allowDirs} },
  },
  build: {
    outDir: 'pikka-console-dist',
    emptyOutDir: true,
  },
  define: {
    __PIKKA_CONSOLE__: true,
    __PIKKA_DEV__: true,
  },
  // 如需 React/Vue 插件可自行加上
  plugins: []
}));
`;
  writeFileSync(outConfigPath, fileContent);

  console.log("✅ 已建立 pikka-console.config.js");
  console.log(`   root: ${consoleRoot}`);
  console.log(`   入口: ${entry}`);
  console.log("   預設 Port: 3749");
  return outConfigPath;
}

// ----------------------------- commands -----------------------------------
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
  console.log(
    "  pikka-console init              # 初始化配置（建立 .pikka/console + config）"
  );
  console.log(
    "  pikka-console dev               # 啟動開發服務器（獨立 root）"
  );
  console.log("  pikka-console dev --port 8080   # 指定端口");
  console.log("  pikka-console version           # 顯示版本");
  console.log("\n範例：");
  console.log("  npx pikka-console init");
  console.log("  pnpm run dev:console");
  console.log("  pnpm run dev:all  # 同時啟動原專案 + Console");
}
