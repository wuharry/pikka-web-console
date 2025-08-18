# Pikka Web Console

一個現代化的網頁內嵌式控制台監控工具，用於攔截和展示 JavaScript console 輸出。

## 📋 專案概述

Pikka Web Console 是一個輕量級的網頁控制台工具，能夠即時監控和展示網頁中的 console 輸出，包括 `log`、`error`、`warn` 和 `info` 訊息。它提供一個清晰的分頁介面，方便開發者進行除錯和日誌分析。

### 核心特性

- 🎯 **即時監控**：攔截原生 console 方法，不影響原有功能
- 📊 **分類展示**：按日誌類型分頁展示（Log、Error、Warn、Info、All）
- 🎨 **美觀介面**：使用 TailwindCSS 構建的現代化 UI
- 🔧 **可嵌入**：可打包為庫並嵌入其他專案
- ⚡ **高效能**：基於 Vite 和 TypeScript 構建

## 🏗️ 專案架構

### 目錄結構

```
Pikka-web-console/
├── src/
│   ├── backend/               # 後端服務
│   │   ├── main.ts           # Hono 服務器主檔案
│   │   └── processConsole.ts # 控制台處理邏輯
│   ├── html/
│   │   └── console-page.html # 控制台頁面模板
│   ├── console.ts            # 控制台監控核心邏輯
│   ├── main.ts              # 前端入口檔案
│   ├── style.css            # 全域樣式
│   └── web.ts               # 網頁互動邏輯
├── public/                   # 靜態資源
├── dist/                     # 打包輸出目錄
├── package.json             # 專案配置
├── tsconfig.json           # TypeScript 配置
├── vite.config.ts          # Vite 構建配置
└── index.html              # HTML 入口檔案
```

### 技術棧

**前端**
- **TypeScript** - 類型安全的 JavaScript
- **Vite** - 快速的前端構建工具
- **TailwindCSS** - 實用優先的 CSS 框架

**後端**
- **Hono** - 輕量級 Web 框架
- **Node.js** - 後端運行環境
- **tsx** - TypeScript 執行器

**開發工具**
- **pnpm** - 高效的包管理器
- **concurrently** - 並行執行腳本
- **nodemon** - 後端自動重啟工具

## 🔧 核心模組詳解

### 1. Console 監控模組 (`src/console.ts`)

這是專案的核心模組，負責攔截和監控原生 console 方法：

**主要功能：**
- 攔截 `console.log`、`console.error`、`console.warn`、`console.info`
- 安全序列化各種數據類型
- 維護不同類型的日誌集合
- 保持原生 console 方法的正常運作

**關鍵特性：**
```typescript
const safeStringify = (arg: unknown) => {
  try {
    return typeof arg === "string" ? arg : JSON.stringify(arg);
  } catch {
    return "[Unserializable]";
  }
};
```

### 2. Web 互動模組 (`src/web.ts`)

處理使用者介面的互動邏輯：

**主要功能：**
- Tab 切換邏輯
- 動態內容渲染
- 顏色主題管理
- HTML 內容安全處理

**Tab 顏色配置：**
```typescript
const TAB_COLOR_MAP = {
  Log: "bg-blue-300",
  Error: "bg-red-300",
  Warn: "bg-yellow-300",
  Info: "bg-green-300",
  All: "bg-gray-300",
};
```

### 3. 後端服務 (`src/backend/`)

基於 Hono 框架的輕量級後端服務：

**端口配置：**
- 前端開發服務器：`7770`
- 後端 API 服務器：`8174`

**API 端點：**
- `GET /` - 基本健康檢查
- `GET /api/log` - 日誌相關 API

### 4. 構建配置 (`vite.config.ts`)

專為庫開發優化的 Vite 配置：

**關鍵配置：**
- 多格式輸出：ES、UMD、IIFE
- 自定義檔案命名：`inpage-console.{format}.js`
- CSS 處理：統一輸出為 `inpage-console.css`
- 代理設置：前端 `/api` 請求代理到後端

## 🚀 快速開始

### 環境要求

- Node.js >= 18
- pnpm >= 9.0.0

### 安裝依賴

```bash
pnpm install
```

### 開發模式

```bash
# 同時啟動前後端開發服務器
pnpm dev

# 僅啟動前端
pnpm dev:frontend

# 僅啟動後端
pnpm dev:backend
```

### 構建

```bash
# 完整構建
pnpm build

# 僅構建前端
pnpm build:frontend

# 僅構建後端
pnpm build:backend
```

### 預覽

```bash
pnpm preview
```

## 📦 打包使用

專案會打包成多種格式供不同場景使用：

- **ES Module**: `dist/inpage-console.es.js`
- **UMD**: `dist/inpage-console.umd.js`
- **IIFE**: `dist/inpage-console.iife.js`
- **樣式檔案**: `dist/inpage-console.css`

### 使用方式

```html
<!-- 在網頁中引入 -->
<link rel="stylesheet" href="dist/inpage-console.css">
<script src="dist/inpage-console.iife.js"></script>
```

或使用 ES Module：

```javascript
import 'dist/inpage-console.css';
import { consoleMonitor } from 'dist/inpage-console.es.js';
```

## 🎨 UI 設計

### 設計原則

- **深色主題**：適合長時間開發使用，減少眼部疲勞
- **顏色編碼**：不同日誌類型使用不同顏色區分
- **響應式設計**：適配各種螢幕尺寸
- **可讀性優先**：使用等寬字體，保持訊息對齊

### 主題色彩

| 日誌類型 | 主色調 | 用途 |
|---------|--------|------|
| Log | 藍色 (Blue) | 一般日誌訊息 |
| Error | 紅色 (Red) | 錯誤訊息 |
| Warn | 黃色 (Yellow) | 警告訊息 |
| Info | 綠色 (Green) | 資訊訊息 |
| All | 灰色 (Gray) | 綜合檢視 |

## 🔄 開發流程

### 腳本命令

```json
{
  "dev": "同時啟動前後端開發服務器",
  "dev:frontend": "啟動前端 Vite 開發服務器",
  "dev:backend": "啟動後端 Hono 服務器（自動重啟）",
  "build": "完整構建專案",
  "build:frontend": "構建前端資源",
  "build:backend": "編譯後端 TypeScript",
  "preview": "預覽構建結果",
  "start:backend": "啟動後端生產服務器"
}
```

### 開發建議

1. **前端開發**：主要修改 `src/` 目錄下的檔案
2. **樣式調整**：使用 TailwindCSS 類別，避免自定義 CSS
3. **類型安全**：充分利用 TypeScript 的類型檢查
4. **模組化**：保持模組間的清晰分離

## 🐛 已知限制

1. **錯誤捕獲**：目前註解了部分錯誤捕獲邏輯（window.onerror 等）
2. **後端功能**：後端目前僅提供基礎 API，功能有限
3. **輸入功能**：HTML 模板中的 console 輸入框尚未實作邏輯

## 🤝 貢獻指南

1. Fork 此專案
2. 創建功能分支：`git checkout -b feature/AmazingFeature`
3. 提交變更：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 開啟 Pull Request

## 📄 授權條款

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 👥 作者

- **wuharry** - 初始作者和維護者

---

*這是一個開源專案，歡迎社群貢獻和回饋！*
