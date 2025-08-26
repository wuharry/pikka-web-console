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

**後端**
- **Hono** - 輕量級 Web 框架
- **Node.js** - 後端運行環境
- **tsx** - TypeScript 執行器

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

## 🔧 核心模組詳解

### 1. 程式主入口 (`src/main.ts`)

**技術實作基礎：**
```typescript
/**
 * 套件主要入口點
 * 
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Entry Point Layer
 * 
 * 引入app/main->立即使用
 */
```

**職責：**
- 作為整個套件的統一入口點
- 負責引入客戶端主模組並立即執行
- 遵循分層架構的 Entry Point Layer 設計模式

### 2. 客戶端入口模組 (`src/client/app/main.ts`)

**技術實作基礎：**
```typescript
/**
 * 客戶端應用入口
 * 
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Client App Layer
 * 職責：環境檢測、DOM 就緒檢測、應用啟動協調
 */
```

**主要功能：**
- **環境檢測**：檢測是否在瀏覽器環境中運行，避免 SSR 環境問題
- **DOM 就緒檢測**：智能檢測 DOM 載入狀態，適時啟動應用
- **全域物件掛載**：將應用實例掛載到 `window.consoleApp`
- **應用啟動協調**：調用應用控制器進行啟動流程

### 3. 應用控制器模組 (`src/client/app/app-controller.ts`)

**技術實作基礎：**
```typescript
/**
 * 應用控制器 - 管理應用的生命週期和狀態
 *
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Application Layer
 * 職責：協調各層，管理應用生命週期，不包含具體業務邏輯
 */
```

**主要職責：**
- **應用狀態管理**：統一管理整個應用的狀態和生命週期
- **模組協調**：作為各個組件（監控器、UI、工具）之間的協調中心
- **DOM 初始化**：負責 HTML 模板掛載和基礎 DOM 結構建立
- **核心服務啟動**：協調 UI 控制器和核心服務的啟動
- **開發模式支援**：提供開發環境下的額外功能和測試

**API 介面：**
```typescript
// 實際的應用控制器 API
interface AppController {
  initialize(): boolean      // 初始化應用
  bootUp(): boolean         // 啟動應用
  restart(): boolean        // 重啟應用
  stop(): void             // 停止應用
  getApplicationStatus(): { isInitialized: boolean; isStarted: boolean }
  isReady(): boolean       // 檢查應用是否就緒
}
```

### 4. UI 控制器模組 (`src/client/components/main.ts`)

**技術實作基礎：**
```typescript
/**
 * UI 控制器 - 管理使用者介面互動和渲染
 *
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Presentation Layer
 * 職責：管理 UI 渲染、事件處理、與服務層互動
 */
```

**主要職責：**
- **服務模組協調**：創建和管理 console 監控服務
- **渲染器管理**：調用 `renderTabs` 進行 UI 渲染
- **資源釋放**：提供 `stop` 方法停止監聽和釋放資源
- **抽象化層級**：作為應用控制器和核心服務之間的抽象層

**API 介面：**
```typescript
interface UIController {
  render(): void    // 渲染 UI 組件
  stop(): void      // 停止和清理資源
}
```

### 5. 核心服務層模組 (`src/client/core/main.ts`)

**技術實作基礎：**
```typescript
/**
 * 核心服務層 - 提供 console 攔截和錯誤收集服務
 *
 * 技術實作基礎：
 * Layered Architecture 分層架構 - Service Layer
 * 職責：數據封裝、核心業務邏輯、服務統一
 */
```

**主要職責：**
- **數據狀態管理**：封裝 `ConsoleDataStore`，不讓外部直接操作
- **服務統一**：整合 `consoleInterceptor` 和 `errorCollector`
- **資源管理**：提供統一的 `cleanUp` 方法
- **數據存取 API**：提供安全的數據取用方法

**API 介面：**
```typescript
interface ConsoleService {
  cleanUp(): void                    // 清理資源
  getterStore(): ConsoleDataStore    // 獲取完整狀態
  getLog(): string[]                 // 獲取日誌
  getError(): string[]               // 獲取錯誤
  getInfo(): string[]                // 獲取資訊
  getWarn(): string[]                // 獲取警告
}
```

### 6. 控制台攔截器模組 (`src/client/core/console-interceptor.ts`)

**技術實作基礎：**
```typescript
/**
 * 控制台攔截器 - 攔截和監控原生 console 方法
 *
 * 技術實作基礎：
 * Interceptor Pattern 攔截器模式
 * 職責：整裝原生 API，不破壞原有功能，增加監控能力
 */
```

**主要功能：**
- **方法攔截**：攔截 `console.log`、`console.error`、`console.warn`、`console.info`
- **數據序列化**：安全序列化各種數據類型（透過 `safeStringify`）
- **時間戳增加**：為所有訊息增加時間戳（透過 `addTimestamp`）
- **原始功能保持**：使用 `apply` 調用原始 console 方法
- **可還原性**：提供 `restoreLog` 方法恢復原始狀態

**技術特色：**
- **閉包保存**：使用閉包保存原始 console 方法參照
- **非破壞性**：不破壞原有功能，只增加監控能力
- **模組化設計**：與錯誤收集器分離，職責單一

### 7. 錯誤收集器模組 (`src/client/core/error-collector.ts`)

**技術實作基礎：**
```typescript
/**
 * 錯誤收集器 - 全域錯誤監控和收集
 *
 * 技術實作基礎：
 * Observer Pattern 觀察者模式 + Event Listener Pattern
 * 職責：監聽全域錯誤事件，統一收集和格式化
 */
```

**主要功能：**
- **JavaScript 運行時錯誤**：捕獲 `ErrorEvent` 類型的 JS 錯誤
- **資源載入錯誤**：捕獲圖片、腳本、樣式等資源 404 錯誤
- **Promise 拒絕監控**：監控未處理的 `unhandledrejection` 事件
- **錯誤去重**：使用結構化的 key 策略避免重複錯誤
- **錯誤分類**：区分 JS 錯誤、資源錯誤、Promise 錯誤

**技術特色：**
- **Event Capture**：使用 `{ capture: true }` 提早捕獲錯誤
- **智能辨識**：根據 `e.target` 辨識錯誤類型（JS vs 資源）
- **Key 策略**：創建結構化的錯誤索引 `RES|IMG|url` / `JS|message|file|line|col`
- **清理機制**：提供 `stop()` 方法移除事件監聽器

**錯誤類型識別：**
```typescript
// 資源錯誤：e.target !== window
// key: "RES|IMG|image.jpg"
// key: "RES|SCRIPT|script.js"

// JS 錯誤：e.target === window  
// key: "JS|undefined property|file.js|10|5"

// Promise 錯誤：
// key: "PR|Promise UnhandledRejection: error message"
```

### 8. 控制台渲染器模組 (`src/client/components/console-renderer.ts`)

處理使用者介面的互動邏輯：

**主要功能：**
- **Tab 切換邏輯**：處理分頁標籤的點擊事件和狀態切換
- **動態內容渲染**：根據選中的 Tab 動態渲染對應的日誌內容
- **分類標籤的樣式管理**：管理不同類型日誌的顏色主題
- **日誌訊息顯示格式化**：格式化訊息顯示，包含時間戳和類型標籤
- **All 頁面統合顯示**：將所有類型的日誌合併顯示在統一介面

**實現細節：**
- 使用 `TAB_CONTENT_MAP` 映射不同 Tab 類型到對應的內容生成函數
- 透過 `TAB_ACTIVE_CLASSES` 定義各種日誌類型的主題色彩
- 支援滾動顯示，最大高度限制為 `max-h-96`
- 使用 `hover:bg-gray-50` 提供滑鼠懸停效果

**Tab 顏色配置：**
```typescript
const TAB_ACTIVE_CLASSES = {
  log: "bg-blue-600",
  error: "bg-red-600",
  warn: "bg-yellow-600", 
  info: "bg-green-600",
  all: "bg-slate-700",
};
```

### 5. HTML 工具模組 (`src/client/utils/html-utils.ts`)

提供 HTML 安全處理和顯示相關功能：

**主要功能：**
- **HTML 字符轉義**：使用原生 DOM API 安全轉義 HTML 字符，防止 XSS 攻擊
- **消息格式化顯示**：提供統一的消息 HTML 格式，包含類型標籤、時間戳和內容
- **消息列表渲染**：批量生成消息列表的 HTML 結構

**安全特性：**
- 透過 `document.createElement` 和 `textContent` 進行安全的 HTML 轉義
- 避免使用 `innerHTML` 直接插入用戶內容
- 使用 `<pre>` 標籤保持訊息的原始格式和換行

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

### 7. 服務端API (`src/server/api/main.ts`)

基旼Hono框架的輕量級後端服務：

**端口配置：**
- 前端開發服務器：`7770`
- 後端 API 服務器：`8174`

**API 端點：**
- `GET /` - 基本健康檢查
- `GET /api/log` - 日誌相關 API

### 8. 構建配置 (`vite.config.ts`)

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
2. **後端開發**：主要修改 `src/server/` 目錄下的檔案
3. **樣式調整**：使用 TailwindCSS 類別，避免自定義 CSS
4. **類型安全**：充分利用 TypeScript 的類型檢查
5. **模組化**：保持模組間的清晰分離

## 🐛 已知限制

1. **錯誤捕獲**：部分錯誤捕獲邏輯（window.onerror 等）正在完善
2. **後端功能**：後端目前僅提供基礎 API，功能持續擴展中
3. **輸入功能**：HTML 模板中的 console 輸入框功能實現中

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
