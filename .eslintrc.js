/* eslint-disable no-undef */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  plugins: [
    "@typescript-eslint",
    "unused-imports",
    "simple-import-sort",
    "import",
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    // 如果你有用 Prettier，可開啟下面這行：
    // "plugin:prettier/recommended",
  ],
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // 一般建議
    "no-debugger": "warn",
    "no-console": "off", // 你需要攔 console，別擋

    // 匯入排序與未使用匯入/變數
    "import/order": "off",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
      "warn",
      {
        vars: "all",
        varsIgnorePattern: "^_",
        args: "after-used",
        argsIgnorePattern: "^_",
      },
    ],

    // 其他 TS 小偏好（可自行調整）
    "@typescript-eslint/consistent-type-imports": [
      "warn",
      { prefer: "type-imports" },
    ],
    "@typescript-eslint/no-explicit-any": "off",
  },

  overrides: [
    // JSON / JSONC / JSON5
    {
      files: ["*.json", "*.jsonc", "*.json5"],
      parser: "jsonc-eslint-parser",
      extends: ["plugin:jsonc/recommended-with-jsonc"],
      rules: {
        "jsonc/no-comments": "off", // 如果使用 eslint-plugin-jsonc
      },
    },
    // YAML
    {
      files: ["*.yml", "*.yaml"],
      extends: ["plugin:yml/standard"],
    },
    // 定義檔
    {
      files: ["**/*.d.ts"],
      rules: { "import/no-duplicates": "off" },
    },
    // Node 設定檔（Vite、Vitest、Tailwind、PostCSS…）
    {
      files: [
        "vite.config.*",
        "vitest.config.*",
        "tailwind.config.*",
        "postcss.config.*",
        "**/*.config.*",
      ],
      env: { node: true },
    },
  ],

  ignorePatterns: [
    "dist/",
    "build/",
    "coverage/",
    ".vite/",
    ".turbo/",
    "node_modules/",
    "public/",
    "*.min.*",
  ],
};
