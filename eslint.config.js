// eslint.config.js

// 1. 匯入 XO 規則集合（偏向 opinionated，會幫你套用一堆嚴格的程式碼風格規則）
import config from "eslint-config-xo";

// 2. Flat Config helper（讓 TS/JS 都有型別提示）
import { defineConfig } from "eslint/config";

// 3. 官方內建的 JavaScript 基本規則集合（等於 eslint:recommended）
import js from "@eslint/js";

// 4. 不同執行環境的全域變數清單（這裡我們會啟用 browser 的 window, document 等）
import globals from "globals";

// 5. TypeScript ESLint 規則集合（包含 parser 與 plugin）
import tseslint from "typescript-eslint";

// 6. TypeScript ESLint plugin 與 parser (有時候需要單獨掛在 plugins / parserOptions)
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";

// 7. Prettier 整合：關閉 ESLint 與 Prettier 衝突規則
import prettierConfig from "eslint-config-prettier";

// 8. Prettier 插件：讓 ESLint 可以直接跑 prettier --check 效果
import prettierPlugin from "eslint-plugin-prettier";

/**
 * 📌 Pikka Web Console ESLint Configuration
 * 適用於 TypeScript + Vite + Prettier 專案
 */

export default defineConfig([
  // 一、XO 規則 (opinionated)
  config,

  // 二、基礎配置：JS + TS
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], // 套用到 JS / TS 檔案

    // 啟用 JS plugin
    plugins: { js },

    // 使用 JS 推薦規則（相當於 eslint:recommended）
    extends: ["js/recommended"],

    // 語言層設定
    languageOptions: {
      globals: globals.browser, // 加入瀏覽器常見的全域變數
      parser: typescriptParser, // 用 TS parser 處理 TS/JS
      parserOptions: {
        ecmaVersion: "latest", // 使用最新 ECMAScript 語法
        sourceType: "module", // 支援 ES Modules (import/export)
        project: "./tsconfig.json", // 讀取 tsconfig，開啟 type-aware lint 規則
      },
    },

    // 插件：TS 與 Prettier
    plugins: {
      "@typescript-eslint": typescriptEslint,
      prettier: prettierPlugin,
    },

    // 規則區
    rules: {
      // === Prettier 整合 ===
      "prettier/prettier": "error", // 如果程式碼不符合 Prettier 格式 → 報錯

      // === Stylistic 規則（程式碼風格） ===
      "@stylistic/indent": ["error", 2], // 縮排強制 2 空格
      "@stylistic/semi": ["error", "always"], // 強制每行結尾加分號
      "@stylistic/quotes": ["error", "single"], // 強制字串用單引號
      "@stylistic/comma-dangle": ["error", "es5"], // ES5 允許的尾逗號風格

      // === TypeScript 規則 ===
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }, // 允許以 _ 開頭的變數/參數不算未使用
      ],
      "@typescript-eslint/explicit-function-return-type": "off", // 關閉：不要求每個函式都寫回傳型別
      "@typescript-eslint/no-explicit-any": "warn", // 不鼓勵 any，但只給 warning
      "@typescript-eslint/prefer-const": "error", // TS 層級要求能用 const 就用 const
      "@typescript-eslint/no-var-requires": "error", // 禁止使用 CommonJS require

      // === 通用規則 ===
      "no-console": "warn", // 禁止留下 console，僅警告
      "no-debugger": "warn", // 禁止 debugger，僅警告
      "no-duplicate-imports": "error", // 禁止重複 import
      "prefer-const": "error", // JS 層級要求能用 const 就用 const

      // === 關閉與 Prettier / Stylistic 衝突的內建規則 ===
      indent: "off",
      semi: "off",
      quotes: "off",
    },
  },

  // 三、TypeScript 官方推薦規則 (等同 plugin:@typescript-eslint/recommended)
  tseslint.configs.recommended,

  // 四、Prettier 規則集合（會自動關閉 ESLint 中與 Prettier 衝突的規則）
  prettierConfig,

  // 五、忽略清單（你已經說不用註解，這裡保留原樣）
  {
    ignores: [
      "node_modules/",
      "dist/",
      "dist-*/",
      "build/",
      ".next/",
      "coverage/",
      "**/*.min.js",
      "**/*.json",
      "**/*.jsonc",
      "**/*.json5",
      ".vscode/",
      ".github/",
    ],
  },
]);
