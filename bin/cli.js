// bin / cli.js;

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import { dirname, join } from "node:path";

console.log("=".repeat(50));
console.log("🎯 初始化 Pikka Console");
console.log("=".repeat(50));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ----------------------------- Args dispatch ------------------------------
const args = process.argv.slice(2);

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

// -------------------------- Utilities / shared ----------------------------
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
function isESModuleProject(cwd = process.cwd()) {
  const pkgPath = path.join(cwd, "package.json");
  if (!existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    return pkg.type === "module";
  } catch {
    return false;
  }
}

// 根據你的專案尋找 console 入口（只允許程式檔，不要 HTML）
function resolveConsoleEntry(cwd = process.cwd()) {
  // 1) 先讀 package.json 自訂（推薦）
  try {
    const pkg = JSON.parse(
      readFileSync(path.join(cwd, "package.json"), "utf8")
    );
    const custom = pkg?.pikkaConsole?.entry;
    if (custom) {
      const abs = path.isAbsolute(custom) ? custom : path.join(cwd, custom);
      if (existsSync(abs)) {
        console.log(`🎯 使用 package.json 指定入口: ${abs}`);
        return abs;
      }
    }
  } catch {}

  // 2) 優先 console 入口，再退一般慣例
  const candidates = [
    path.join(cwd, "src/client/app/main.ts"),
    path.join(cwd, "src/client/app/main.tsx"),
    path.join(cwd, "src/client/app/main.js"),
    path.join(cwd, "src/index.ts"),
    path.join(cwd, "src/index.tsx"),
    path.join(cwd, "src/main.ts"),
    path.join(cwd, "src/main.tsx"),
    path.join(cwd, "src/main.js"),
    path.join(cwd, "src/main.jsx"),
    // 已安裝的發佈檔
    path.join(cwd, "node_modules/pikka-web-console/dist/main.js"),
  ];

  for (const fp of candidates) {
    if (existsSync(fp)) {
      console.log(`🎯 找到入口文件: ${fp}`);
      return fp;
    }
  }

  // 3) 調試輸出
  if (existsSync(path.join(cwd, "src"))) {
    try {
      const srcFiles = readdirSync(path.join(cwd, "src"));
      console.log(`📁 src/: ${srcFiles.join(", ")}`);
    } catch {}
  }
  return null;
}

// ------------------------------ dev 啟動 -------------------------------
async function startViteServer(port = 3749) {
  const cwd = process.cwd();
  const isESM = isESModuleProject(cwd);
  const mjs = join(cwd, "pikka-console.config.mjs");
  const cjs = join(cwd, "pikka-console.config.js");
  const configPath = existsSync(isESM ? mjs : cjs)
    ? isESM
      ? mjs
      : cjs
    : existsSync(mjs)
      ? mjs
      : cjs;

  if (!existsSync(configPath)) {
    console.error("❌ 找不到 pikka-console.config.(mjs|js)");
    console.log("💡 請先執行: npx pikka-console init");
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
    console.log(`💡 請檢查 ${path.basename(configPath)} 是否合法`);
    process.exit(1);
  }
}

// ------------------------- package.json scripts --------------------------
function addConsoleScriptsToPackageJson(cwd = process.cwd(), opts = {}) {
  const pkgPath = path.join(cwd, "package.json");
  if (!existsSync(pkgPath)) {
    console.error("❌ 找不到 package.json，請在專案根目錄執行！");
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.scripts ||= {};

  // === scripts ===
  pkg.scripts["dev:console"] = "pikka-console dev --port 3749";
  pkg.scripts["console:monitor"] = "pikka-console dev --port 3750";

  if (!pkg.scripts["dev:all"]) {
    const pm = detectPackageManager(cwd);
    pkg.scripts["dev:all"] =
      `concurrently "${pm} run dev" "${pm} run dev:console"`;
    console.log(`💡 建議安裝 concurrently: ${installCmd(pm)} concurrently`);
  }

  // === pikkaConsole.entry（只在未設定時寫入）===
  // 先確保物件存在
  if (!pkg.pikkaConsole || typeof pkg.pikkaConsole !== "object") {
    pkg.pikkaConsole = {};
  }

  if (!pkg.pikkaConsole.entry) {
    // 優先自動偵測
    let detected = resolveConsoleEntry(cwd);

    // 若偵測不到，用預設
    if (!detected) {
      detected = path.join(cwd, "src/client/app/main.ts");
      console.log(`⚠️ 未偵測到入口，使用預設：${detected}`);
    }

    // 轉為相對路徑並用 POSIX 斜線
    const rel = path.relative(cwd, detected);
    const posixRel = rel.split(path.sep).join("/"); // 標準化

    // 最終寫入（前面加 ./ 比較直觀）
    pkg.pikkaConsole.entry = posixRel.startsWith("./")
      ? posixRel
      : `./${posixRel}`;

    // 順手提醒檔案是否存在
    const abs = path.isAbsolute(pkg.pikkaConsole.entry)
      ? pkg.pikkaConsole.entry
      : path.join(cwd, pkg.pikkaConsole.entry);
    if (!existsSync(abs)) {
      console.log(
        `⚠️ 提醒：${pkg.pikkaConsole.entry} 目前不存在，請確認路徑是否正確。`
      );
    } else {
      console.log(`🧭 已設定 pikkaConsole.entry → ${pkg.pikkaConsole.entry}`);
    }
  } else {
    console.log(`ℹ️ 保留現有 pikkaConsole.entry → ${pkg.pikkaConsole.entry}`);
  }

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("✅ 已新增/更新 scripts 與 pikkaConsole 設定：");
  console.log("   - dev:console");
  console.log("   - console:monitor");
  console.log("   - dev:all");
  console.log("   - pikkaConsole.entry");
}

// -------------------- create pikka-console.config.(mjs|js) ----------------
async function createPikkaConsoleConfig(cwd = process.cwd()) {
  const isESM = isESModuleProject(cwd);
  const configFileName = isESM
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

  // 解析 Console 入口
  const entry = resolveConsoleEntry(cwd);
  if (!entry) {
    console.error("❌ 找不到 Console 入口檔。請在 package.json 設定：");
    console.error('   "pikkaConsole": { "entry": "./src/client/app/main.ts" }');
    process.exit(1);
  }

  // 生成 .pikka/console/index.html：用 /@fs 正確引用實體檔
  const fsEntryPath = pathToFileURL(entry).pathname; // 例如：/Users/you/repo/src/client/app/main.ts
  const indexHtml = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Pikka Console</title>
  </head>
  <body>
    <div id="pikka-console-web"></div>
    <script type="module" src="/@fs${fsEntryPath}"></script>
  </body>
</html>`;
  writeFileSync(path.join(consoleRoot, "index.html"), indexHtml);

  // alias（給 "@/..."、"@assets/..." 用）
  const alias = {
    "@": path.join(cwd, "src"),
    "@assets": path.join(cwd, "src", "assets"),
  };
  const allowDirs = JSON.stringify([cwd, path.dirname(entry)]);

  const commonConfigBody = `
  root: ${JSON.stringify(consoleRoot)},
  mode: 'development',
  publicDir: false,
  resolve: { alias: ${JSON.stringify(alias)} },
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
`;

  const fileContent = isESM
    ? `// Auto-generated by pikka-console (isolated root) - ESM
import { defineConfig } from 'vite';
export default defineConfig(({ command, mode }) => ({${commonConfigBody}
}));
`
    : `// Auto-generated by pikka-console (isolated root) - CJS
const { defineConfig } = require('vite');
module.exports = defineConfig(({ command, mode }) => ({${commonConfigBody}
}));
`;

  writeFileSync(outConfigPath, fileContent);

  console.log(`✅ 已建立 ${configFileName}`);
  console.log(`   root: ${consoleRoot}`);
  console.log(`   入口: ${entry}`);
  console.log("   預設 Port: 3749");
  console.log(`   格式: ${isESM ? "ESM (.mjs)" : "CJS (.js)"}`);
  return outConfigPath;
}

// ----------------------------- commands -----------------------------------
async function devCommand(args) {
  console.log("🚀 Starting Pikka Console...");
  const port = args.includes("--port")
    ? parseInt(args[args.indexOf("--port") + 1]) || 3749
    : 3749;
  await startViteServer(port);
}

async function initCommand() {
  const cwd = process.cwd();
  try {
    const entryIdx = args.indexOf("--entry");
    const entryHint =
      entryIdx !== -1 ? args[entryIdx + 1] /* 可能為 undefined */ : undefined;

    addConsoleScriptsToPackageJson(cwd, { entry: entryHint });
    await createPikkaConsoleConfig(cwd);
  } catch (error) {
    console.error("❌ 初始化失敗:", error?.message || error);
    process.exit(1);
  }
}

// -------------------------- version / help --------------------------------
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
