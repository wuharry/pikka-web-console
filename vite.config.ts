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
  // Library / SDK 打包：vite build --mode lib
  // ─────────────────────────────────────────────
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
          entry: "src/client/app/main.ts", // 🔧 改為客戶端入口
          name: "PikkaWebConsole",
          fileName: (fmt) => `inpage-console.${fmt}.js`,
          formats: ["es", "umd", "iife"],
        },
        // 生成類型檔案
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
        emptyOutDir: true,
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
