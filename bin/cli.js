// #!/usr/bin/env node

// /**
//  * Pikka Web Console CLI
//  * 用於啟動 Web Console 服務器
//  */

// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import { spawn } from 'child_process';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// console.log('🚀 Starting Pikka Web Console...');

// // 啟動後端服務器
// const serverPath = join(__dirname, '../src/server/api/main.ts');
// const child = spawn('tsx', [serverPath], {
//   stdio: 'inherit',
//   env: process.env,
// });

// child.on('close', (code) => {
//   console.log(`\n📊 Pikka Web Console exited with code ${code}`);
//   process.exit(code);
// });

// child.on('error', (err) => {
//   console.error('❌ Failed to start Pikka Web Console:', err);
//   process.exit(1);
// });

// // 處理 Ctrl+C
// process.on('SIGINT', () => {
//   console.log('\n⏹️  Stopping Pikka Web Console...');
//   child.kill('SIGINT');
// });

// process.on('SIGTERM', () => {
//   console.log('\n⏹️  Stopping Pikka Web Console...');
//   child.kill('SIGTERM');
// });
//  bin/cli.js
// 腳本,Init用

import { readFileSync, writeFileSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";

// args：取使用者輸入的子命令，例如 npx your-console-monitor init 時 args[0] === "init"。
const args = process.argv.slice(2);

// 代表使用者要「自動配置」。
if (args[0] === "init") {
  // cwd：目前專案路徑。
  const cwd = process.cwd();

  // pkgPath：專案的 package.json 絕對路徑。
  const pkgPath = path.join(cwd, "package.json");

  // existsSync 檢查：確保你是在專案根目錄執行（否則不知道要改哪個 package.json）。
  if (!existsSync(pkgPath)) {
    console.error("找不到 package.json，請在專案根目錄執行！");
    process.exit(1);
  }
  // readFileSync + JSON.parse：把 package.json 讀進來成 JS 物件好修改。
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

  // 1. 新增 script 為空或是原值
  pkg.scripts ||= {};
  pkg.scripts["dev:peekConsole"] = "your-console-monitor dev";

  // 2. 寫回 package.json＋排版＋成功訊息
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("✔ 已新增 script: dev:peekConsole");

  // 3. 複製/生成配置檔（選擇性）--> 複製 console-monitor.config.js
  // 這個檔案應該之後可以加,內容可能會像是一些設定檔
  // EX:export default {
  //   port: 7770,           // 監聽的 port
  //   ui: true,             // 是否啟動內建的 web UI
  //   autoStartDev: "pnpm dev", // 是否順便幫使用者啟動他專案的 dev server
  //   filters: ["warn", "error"], // 要監看的 log 類型
  // };

  //   const configPath = path.join(cwd, "console-monitor.config.js");
  //   if (!existsSync(configPath)) {
  //     writeFileSync(configPath, `export default { port: 7770, ui: true };\n`);
  //     console.log("✔ 已建立 console-monitor.config.js");
  //   }

  // 4. 安裝依賴（確保自己被寫進 devDependencies）
  // 偵測套件管理器：透過 npm_config_user_agent 大致判斷使用者是 pnpm/yarn/npm。
  const pm = process.env.npm_config_user_agent?.includes("pnpm")
    ? "pnpm"
    : process.env.npm_config_user_agent?.includes("yarn")
      ? "yarn"
      : "npm";

  console.log(`▶ 安裝中（偵測到 ${pm}）...`);
  spawnSync(pm, ["install", "-D", "your-console-monitor"], {
    //   stdio: "inherit"：把子進程的輸出直接顯示在使用者的終端上，讓他看到安裝進度。
    stdio: "inherit",
  });
} else if (args[0] === "dev") {
  // 啟動你的監聽 server
  // 目前後端沒有寫
  import("./server/api/main.js");
} else {
  console.log("用法：");
  console.log("  npx your-console-monitor init   # 初始化配置");
  console.log("  npx your-console-monitor dev    # 啟動監控伺服器");
}
