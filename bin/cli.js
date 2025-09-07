#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import path from "path";
import { createServer } from "http";
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);

if (args[0] === "init") {
  const cwd = process.cwd();
  const pkgPath = path.join(cwd, "package.json");

  if (!existsSync(pkgPath)) {
    console.error("❌ 找不到 package.json，請在專案根目錄執行！");
    process.exit(1);
  }

  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.scripts ||= {};
  pkg.scripts["dev:console"] = "pikka-console dev";
  pkg.scripts["console:monitor"] = "pikka-console dev";

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("✅ 已新增 scripts:");
  console.log("   - dev:console");
  console.log("   - console:monitor");

  // 創建配置檔案（可選）
  const configPath = path.join(cwd, "pikka-console.config.js");
  if (!existsSync(configPath)) {
    const configContent = `export default {
  ui: {
    port: 7770,
    open: true
  },
  capture: {
    levels: ['log', 'warn', 'error', 'info'],
    exclude: []
  }
};`;
    writeFileSync(configPath, configContent);
    console.log("✅ 已建立 pikka-console.config.js");
  }

  console.log("\n🎉 初始化完成！");
  console.log("執行以下指令啟動：");
  console.log("  npm run dev:console");
  console.log("  # 或");
  console.log("  npx pikka-console dev");
} else if (args[0] === "dev") {
  console.log("🚀 Starting Pikka Web Console...");

  const port = args.includes("--port")
    ? parseInt(args[args.indexOf("--port") + 1]) || 7770
    : 7770;

  startStaticServer(port);
} else if (
  args[0] === "version" ||
  args[0] === "-v" ||
  args[0] === "--version"
) {
  const pkgPath = join(__dirname, "../package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    console.log(`pikka-web-console v${pkg.version}`);
  }
} else {
  console.log("🔍 Pikka Web Console CLI");
  console.log("\n用法：");
  console.log("  pikka-console init              # 初始化配置");
  console.log("  pikka-console dev               # 啟動 Web UI");
  console.log("  pikka-console dev --port 8080   # 指定端口");
  console.log("  pikka-console version           # 顯示版本");
  console.log("\n範例：");
  console.log("  npx pikka-console init");
  console.log("  npm run dev:console");
}

async function startStaticServer(port) {
  const uiPath = join(__dirname, "../dist/ui");

  if (!existsSync(uiPath)) {
    console.error("❌ UI files not found:", uiPath);
    console.log(
      '💡 Please run "npm run build" in your pikka-web-console package first.'
    );
    process.exit(1);
  }

  const server = createServer(async (req, res) => {
    let filePath = join(uiPath, req.url === "/" ? "index.html" : req.url);

    // 處理 SPA 路由
    if (!existsSync(filePath) && !req.url.startsWith("/assets/")) {
      filePath = join(uiPath, "index.html");
    }

    try {
      const content = await readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();

      const contentTypes = {
        ".html": "text/html",
        ".js": "application/javascript",
        ".css": "text/css",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".svg": "image/svg+xml",
        ".ico": "image/x-icon",
      };

      res.writeHead(200, {
        "Content-Type": contentTypes[ext] || "text/plain",
        "Access-Control-Allow-Origin": "*", // 允許跨域，方便開發
      });
      res.end(content);
    } catch (error) {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  server.listen(port, async () => {
    console.log(`📊 Pikka Web Console running at:`);
    console.log(`   Local:   http://localhost:${port}`);
    console.log(`   Network: http://0.0.0.0:${port}`);
    console.log("\n💡 Make sure your app is running with Pikka SDK enabled!");

    // 自動開啟瀏覽器
    try {
      const { default: open } = await import("open");
      await open(`http://localhost:${port}`);
    } catch (e) {
      // 如果 open 套件不存在，就不自動開啟
    }
  });

  // 優雅關閉
  process.on("SIGINT", () => {
    console.log("\n⏹️  Stopping Pikka Web Console...");
    server.close(() => {
      process.exit(0);
    });
  });

  process.on("SIGTERM", () => {
    console.log("\n⏹️  Stopping Pikka Web Console...");
    server.close(() => {
      process.exit(0);
    });
  });
}
