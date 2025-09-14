# Pikka Web Console

一個輕量級的網頁內嵌式控制台監控工具，讓你在開發時可以即時檢視 JavaScript console 輸出。

[![npm version](https://img.shields.io/npm/v/pikka-web-console.svg)](https://www.npmjs.com/package/pikka-web-console)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 特色功能

- 🎯 **即時監控** - 攔截並展示所有 console 輸出（log、error、warn、info）
- 🎨 **美觀介面** - 現代化的分頁式控制台界面
- ⚡ **快速啟動** - 一個命令即可初始化和啟動
- 🔧 **零配置** - 自動檢測並配置你的 Vite 專案
- 📱 **響應式設計** - 適配各種螢幕尺寸

## 📦 安裝

```bash
# 使用 npm
npm install --D pikka-web-console

# 使用 pnpm
pnpm add --D pikka-web-console

# 使用 yarn
yarn add --D pikka-web-console

# 全域安裝（不推薦）
npm install -g pikka-web-console
```

## 🚀 快速開始

### 1. 初始化

在你的專案根目錄執行：

```bash
npx pikka-console init
```

這會：

- 創建 `pikka-console.config.js` 配置檔案
- 在 `package.json` 中添加便捷腳本

### 2. 啟動控制台

```bash
# 使用新增的腳本
npm run dev:console

# 或直接使用 CLI
npx pikka-console dev
```

### 3. 自定義端口

```bash
# 指定端口啟動
pikka-console dev --port 8080
```

### 4. 同時運行你的專案和控制台

初始化後會自動添加 `dev:all` 腳本：

```bash
npm run dev:all
```

## 📋 可用腳本

初始化後，你的 `package.json` 會新增以下腳本：

```json
{
  "scripts": {
    "dev:console": "pikka-console dev --port 3749",
    "console:monitor": "pikka-console dev --port 3750",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:console\""
  }
}
```

## 🎮 CLI 命令

| 命令                | 描述                      | 範例                            |
| ------------------- | ------------------------- | ------------------------------- |
| `init`              | 初始化 Pikka Console 配置 | `pikka-console init`            |
| `dev`               | 啟動開發服務器            | `pikka-console dev`             |
| `dev --port <port>` | 指定端口啟動              | `pikka-console dev --port 8080` |
| `version`           | 顯示版本資訊              | `pikka-console version`         |

## 🔧 配置

### 基本配置

初始化後會生成 `pikka-console.config.js`：

```javascript
const { defineConfig } = require("vite");

module.exports = defineConfig({
  server: {
    port: 3749,
    host: true,
    cors: true,
    open: false,
  },
  // ... 其他 Vite 配置
});
```

### 自定義配置

你可以手動編輯配置檔案來：

- 修改預設端口
- 添加 Vite 插件
- 調整 server 設定
- 自定義建置選項

## 💡 使用場景

### 適合什麼時候使用？

- ✅ 開發 SPA 應用時需要監控 console 輸出
- ✅ 除錯複雜的前端邏輯
- ✅ 需要在不同視窗檢視 console 訊息
- ✅ 團隊協作時分享 console 輸出

### 技術要求

- Node.js >= 18
- 支援 ES Modules 的專案
- 推薦使用 Vite 構建工具

## 🎯 工作原理

Pikka Console 會：

1. 檢測你的專案配置（自動載入 `vite.config.ts`）
2. 創建專用的開發服務器
3. 提供網頁界面來展示 console 輸出
4. 攔截並分類顯示所有類型的 console 訊息

## 📚 相關文檔

- [開發者文檔](./docs/DEVELOPMENT.md) - 詳細的技術架構和開發指南
- [GitHub Repository](https://github.com/wuharry/pikka-web-console)
- [問題回報](https://github.com/wuharry/pikka-web-console/issues)

## 🤝 支持

遇到問題？

1. 查看 [FAQ](#faq)
2. 檢查 [已知問題](https://github.com/wuharry/pikka-web-console/issues)
3. 提交 [新問題](https://github.com/wuharry/pikka-web-console/issues/new)

## FAQ

### Q: 為什麼需要 Pikka Console？

A: 當你需要在開發時同時檢視程式碼和 console 輸出時，Pikka Console 提供了一個獨立的網頁界面，讓你可以更方便地監控和除錯。

### Q: 支援哪些專案類型？

A: 主要支援使用 Vite 的現代前端專案，也可以配置用於其他類型的專案。

### Q: 會影響生產環境嗎？

A: 不會。Pikka Console 只在開發環境中運行，不會打包到生產版本中。

## 📄 授權

MIT © [吳浩維](https://github.com/wuharry)

---

⭐ 如果這個工具對你有幫助，請給我們一個 Star！
