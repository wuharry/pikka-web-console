// vite.config.ts
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    lib: {
      entry: "src/main.ts", // 你的入口
      name: "PikkaWebConsole",
      fileName: (fmt) => `inpage-console.${fmt}.js`, //build後輸出的檔案名稱
      formats: ["es", "umd", "iife"],
    },
    rollupOptions: {
      output: {
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
