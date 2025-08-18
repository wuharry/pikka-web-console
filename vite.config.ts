// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 7770, // 前端開發伺服器的端口
    strictPort: true, // 如果端口被佔用，則不啟動伺服器
    proxy: {
      // 代理配置
      "/api": {
        target: "http://localhost:8174", // 後端伺服器地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",

    lib: {
      entry: "src/main.ts", // 你的入口
      name: "PikkaWebConsole",
      fileName: (fmt) => `inpage-console.${fmt}.js`, //build後輸出的檔案名稱
      formats: ["es", "umd", "iife"],
    },
    rollupOptions: {
      external: ["@hono/node-server", "hono"], // 外部依賴
      output: {
        globals: {
          hono: "Hono",
          "@hono/node-server": "HonoNodeServer",
        },
        // ✅ 確保 CSS 被正確處理,添加輸出的css檔案
        assetFileNames: (assetInfo) => {
          const names = (assetInfo as any).names as string[] | undefined; // rollup v4
          const legacyName = (assetInfo as any).name as string | undefined; // 兼容舊寫法
          const isCss =
            names?.some((n) => n.endsWith(".css")) ??
            legacyName?.endsWith(".css");

          if (isCss) return "inpage-console.css";
          return "assets/[name][extname]";
        },
      },
    },
    cssCodeSplit: false, // ✅ CSS 打包進 JS
    sourcemap: true, // 可選：更好除錯
  },
});
