// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default defineConfig(({ mode, command }) => {
  // 通用的路徑別名配置
  const aliases = {
    "@": path.resolve(dirname, "src"),
    "@client": path.resolve(dirname, "src/client"),
    "@types": path.resolve(dirname, "src/shared/types"),
    "@assets": path.resolve(dirname, "src/assets"),
    "@utils": path.resolve(dirname, "src/utils"),
  };

  // ─────────────────────────────────────────────
  // Server 打包：vite build --mode server
  // ─────────────────────────────────────────────
  if (mode === "server") {
    return {
      plugins: [],
      resolve: {
        alias: aliases,
      },
      build: {
        outDir: "dist/server",
        ssr: true, // 服務器端渲染模式
        lib: {
          entry: "src/server/api/main.ts",
          name: "PikkaServer",
          fileName: () => "main.js",
          formats: ["es"],
        },
        rollupOptions: {
          external: [
            // Node.js 內建模組
            "fs",
            "path",
            "url",
            "child_process",
            // 保留的依賴（需要在運行時安裝）
            "@hono/node-server",
            "hono",
          ],
          output: {
            format: "es",
          },
        },
        minify: false, // 保持可讀性，方便除錯
        sourcemap: true,
      },
    };
  }

  // ─────────────────────────────────────────────
  // Library / SDK 打包：vite build --mode lib
  // ─────────────────────────────────────────────
  // vite.config.ts - lib 模式部分
  if (mode === "lib") {
    return {
      plugins: [tailwindcss()],
      // 🔧 在庫模式也加上路徑別名解析
      resolve: {
        alias: aliases,
      },
      build: {
        outDir: "dist",
        lib: {
          // ✅ 改為使用 src/main.ts 作為入口，這樣 CSS 才會被包含
          entry: "src/main.ts", // 改成這個！
          name: "PikkaWebConsole",
          fileName: (fmt) => `inpage-console.${fmt}.js`,
          formats: ["es", "umd", "iife"],
        },
        emitTypes: true,
        rollupOptions: {
          // 🔧 庫模式通常不需要外部依賴（除非你要用戶自己安裝）
          external: [], // 移除 hono 相關，因為前端不需要
          output: {
            globals: {},
            // ✅ 確保 CSS 檔名固定（若有輸出 CSS）
            assetFileNames: (assetInfo: any) => {
              const names: string[] | undefined = assetInfo?.names;
              const legacyName: string | undefined = assetInfo?.name;
              const isCss =
                names?.some((n) => n.endsWith(".css")) ??
                legacyName?.endsWith(".css");

              if (isCss) return "inpage-console.css";
              return "assets/[name][extname]";
            },
          },
        },
        cssCodeSplit: false,
        sourcemap: true,
        emptyOutDir: false, // 不清空，避免覆蓋 server 建構
      },
    };
  }

  // ─────────────────────────────────────────────
  // 開發/一般打包：vite dev / vite build（App 模式）
  // ─────────────────────────────────────────────
  return {
    plugins: [
      tailwindcss(),
      react({
        // 啟用React DevTools的組件名稱顯示
        jsxImportSource: "@emotion/react", // 如果使用emotion
      }),
    ],
    server: {
      port: 7770,
      strictPort: true,
      proxy: {
        "/api": {
          target: "http://localhost:8174",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
    resolve: {
      alias: aliases,
    },
    fs: {
      strict: true,
    },
    build: {
      outDir: "dist-dev", // 與 lib 輸出區隔，避免互相覆蓋
      sourcemap: true, // 方便除錯
    },
  };
});
