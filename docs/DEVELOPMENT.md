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
- 🔄 **客戶端-服務器架構**：支持本地和遠程日誌處理

## 🏗️ 專案架構

### 目錄結構

```
Pikka-web-console/
├── .vscode/                            # VS Code 配置
│   └── settings.json                   # 編輯器設定
├── public/                             # 靜態資源目錄
├── src/                                # 主要原始碼目錄
│   ├── assets/                         # 靜態資源
│   │   ├── styles/                     # 全域樣式
│   │   │   └── app.css                 # 主要樣式檔案
│   │   └── template/                   # HTML 模板
│   │       └── console-page.html       # 控制台頁面模板
│   ├── client/                         # 客戶端代碼
│   │   ├── app/                        # 應用主體
│   │   │   ├── app-controller.ts       # 應用控制器
│   │   │   └── main.ts                 # 客戶端入口檔案
│   │   ├── components/                 # UI 組件
│   │   │   ├── console-renderer.ts     # 控制台渲染器
│   │   │   └── index.ts                # 組件導出
│   │   ├── core/                       # 核心功能
│   │   │   ├── console-interceptor.ts  # 控制台攔截器
│   │   │   ├── error-collector.ts      # 錯誤收集器
│   │   │   ├── main.ts                 # 核心入口
│   │   │   └── index.ts                # 核心導出
│   │   ├── types/                      # 客戶端類型定義
│   │   │   ├── console-monitor-types.ts # 監控類型
│   │   │   └── index.ts                # 類型導出
│   │   └── utils/                      # 工具函數
│   │       ├── html-utils.ts           # HTML 處理工具
│   │       ├── tools.ts                # 通用工具函數
│   │       └── index.ts                # 工具導出
│   ├── server/                         # 服務端代碼
│   │   ├── api/                        # API 實現
│   │   │   └── main.ts                 # 主 API 服務
│   │   ├── processConsole.ts           # 伺服器控制台處理
│   │   └── types/                      # 服務端類型
│   │       └── index.ts                # 類型導出
│   ├── shared/                         # 共享資源
│   │   └── types/                      # 共享類型定義
│   │       └── console.types.ts        # 控制台共享類型
│   ├── main.ts                         # 專案主入口
│   ├── style.css                       # 主樣式檔案
│   ├── typescript.svg                  # TypeScript 圖標
│   └── vite-env.d.ts                   # Vite 環境類型定義
├── .gitignore                          # Git 忽略規則
├── eslint.config.js                    # ESLint 配置
├── index.html                          # HTML 入口
├── LICENSE                             # 授權條款
├── package.json                        # 專案配置與依賴
├── pnpm-lock.yaml                      # pnpm 鎖定檔案
├── README.md                           # 專案說明文檔
├── tailwind.config.js                  # TailwindCSS 配置
├── tsconfig.json                       # TypeScript 配置
└── vite.config.ts                      # Vite 構建配置
```

### 技術棧

**前端**
- **TypeScript** - 類型安全的 JavaScript
- **Vite** - 快速的前端構建工具
- **TailwindCSS** - 實用優先的 CSS 框架

**開發工具**
- **pnpm** - 高效的包管理器
- **concurrently** - 並行執行腳本
- **nodemon** - 後端自動重啟工具
- **ESLint/Prettier** - 代碼品質與格式化工具

## 🏗️ 應用架構依賴關係

```
src/main.ts                    ← 🚀 真正的程式入口
    ↓
src/client/app/main.ts         ← 📦 客戶端模組入口
    ↓
src/client/app/app-controller.ts ← 🎮 應用控制器
    ↓
src/client/components/main.ts   ← 🎨 UI 層
    ↓
src/client/core/main.ts        ← ⚙️ 核心服務層
```

### 依賴關係說明

**Entry Point Layer** → **Client App Layer** → **Application Layer** → **Presentation Layer** → **Service Layer**

- **Entry Point**: 套件主要入口，負責模組載入
- **Client App**: 客戶端入口，處理環境檢測和應用啟動
- **Application**: 應用控制器，協調各層級和生命週期管理
- **Presentation**: UI 控制器，管理使用者介面渲染和互動
- **Service**: 核心服務，提供 console 攔截和錯誤收集功能

### 6. 主應用入口 (`src/client/app/main.ts`)

主應用入口負責應用的啟動和基本環境檢測：

**當前功能：**
- **DOM 初始化**：`initializeDOM()` 函數負責掛載 HTML 模板到指定容器
- **環境檢測**：檢測是否在瀏覽器環境中運行，避免 SSR 環境問題
- **啟動流程管理**：`bootsStartUp()` 統一管理啟動順序
- **開發模式支援**：在開發環境下提供額外的日誌和測試功能
- **DOM 就緒檢測**：智能檢測 DOM 載入狀態，適時啟動應用

**重構建議：**
將部分邏輯移入 `app-controller.ts`，使 `main.ts` 更專注於:
- 環境檢測和相容性處理
- 應用控制器的實例化和啟動
- 全域變數的註冊（如 `window.consoleApp`）

**端口配置：**
- 前端開發服務器：`7770`
- 後端 API 服務器：`8174`

### 7. 構建配置 (`vite.config.ts`)

專為庫開發優化的 Vite 配置：

**關鍵配置：**
- 多格式輸出：ES、UMD、IIFE
- 自定義檔案命名：`inpage-console.{format}.js`
- CSS 處理：統一輸出為 `inpage-console.css`
- 代理設置：前端 `/api` 請求代理到後端
- 路徑別名：`@client`、`@server`、`@types` 等

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

# 僅構建前端庫
pnpm build:lib

# 僅構建服務器
pnpm build:server
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
import 'pikka-web-console/dist/inpage-console.css';
import { consoleMonitor } from 'pikka-web-console';
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
  "build:lib": "構建前端庫",
  "build:server": "編譯後端 TypeScript",
  "preview": "預覽構建結果",
  "start:backend": "啟動後端生產服務器"
}
```

### 開發建議

1. **前端開發**：主要修改 `src/client/` 目錄下的檔案
2. **樣式調整**：使用 TailwindCSS 類別，避免自定義 CSS
3. **類型安全**：充分利用 TypeScript 的類型檢查
4. **模組化**：保持模組間的清晰分離

## 🐛 已知限制

1. **錯誤捕獲**：部分錯誤捕獲邏輯（window.onerror 等）正在完善
2. **輸入功能**：HTML 模板中的 console 輸入框功能實現中

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
