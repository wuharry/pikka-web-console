// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default defineConfig(({ mode, command }) => {
  // ─────────────────────────────────────────────
  // Library / SDK 打包：vite build --mode lib
  // ─────────────────────────────────────────────
  if (mode === "lib") {
    return {
      plugins: [tailwindcss()],
      build: {
        outDir: "dist",
        lib: {
          entry: "src/main.ts", // 你的入口
          name: "PikkaWebConsole",
          fileName: (fmt) => `inpage-console.${fmt}.js`,
          formats: ["es", "umd", "iife"],
        },
        rollupOptions: {
          external: ["@hono/node-server", "hono"], // 外部依賴
          output: {
            globals: {
              hono: "Hono",
              "@hono/node-server": "HonoNodeServer",
            },
            // ✅ 確保 CSS 檔名固定（若有輸出 CSS）
            assetFileNames: (assetInfo: any) => {
              const names: string[] | undefined = assetInfo?.names; // rollup v4
              const legacyName: string | undefined = assetInfo?.name; // 舊版相容
              const isCss =
                names?.some((n) => n.endsWith(".css")) ??
                legacyName?.endsWith(".css");

              if (isCss) return "inpage-console.css";
              return "assets/[name][extname]";
            },
          },
        },
        cssCodeSplit: false, // ✅ CSS 打包進 JS（同你原設定）
        sourcemap: true, // 方便除錯
        emptyOutDir: true,
      },
    };
  }

  // ─────────────────────────────────────────────
  // 開發/一般打包：vite dev / vite build（App 模式）
  // ─────────────────────────────────────────────
  return {
    plugins: [tailwindcss()],
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
      alias: {
        "@": path.resolve(dirname, "src"),
        "@client": path.resolve(dirname, "src/client"),
        "@types": path.resolve(dirname, "src/shared/types"),
        "@assets": path.resolve(dirname, "src/assets"),
        "@utils": path.resolve(dirname, "src/utils"),
      },
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
