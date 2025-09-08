// 📁 src/lib/createConsoleServer.ts
import { createServer, ViteDevServer, InlineConfig } from "vite";
import * as path from "node:path";

export interface ConsoleConfig {
  port?: number;
  open?: boolean;
  host?: boolean;
}

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Pikka Console 初始化命令
 *
 * 1. 創建 `.pikka` 目錄
 * 2. 創建 `.pikka/src` 目錄
 * 3. 生成監控界面 HTML、JS、CSS 檔案
 * 4. 顯示成功訊息
 */
/*******  66453c6f-7aef-4576-8181-83107ca43fdd  *******/ export async function createConsoleServer(
  config: ConsoleConfig
): Promise<ViteDevServer> {
  const consoleRoot = path.resolve(".pikka");

  // 確保監控界面有正確的 Vite 配置
  const viteConfig: InlineConfig = {
    root: consoleRoot,
    server: {
      port: config.port || 3749,
      host: config.host !== false,
      open: config.open !== false,
    },
    // 重要：明確指定這是一個標準的 Web 應用
    build: {
      outDir: "dist",
      // 確保正確的入口點
      rollupOptions: {
        input: path.join(consoleRoot, "index.html"),
      },
    },
    // 開發模式設定
    optimizeDeps: {
      include: [], // 不需要預構建任何依賴
    },
  };

  try {
    const server = await createServer(viteConfig);
    await server.listen();

    const address = server.httpServer?.address();
    const port =
      typeof address === "object" && address !== null
        ? address.port
        : config.port;

    console.log(`\n🎯 Pikka Console 已啟動`);
    console.log(`   ➜  監控界面: \x1b[32mhttp://localhost:${port}\x1b[0m`);
    console.log(
      `   ➜  請確保主應用運行在: \x1b[32mhttp://localhost:5173\x1b[0m`
    );

    return server;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ 無法啟動監控界面:", errorMessage);
    throw error;
  }
}

// 📁 src/lib/templates.ts
export function createMonitorHTML(): string {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pikka Console - 應用監控界面</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;
}

export function createMonitorJS(): string {
  return `import './style.css'

// TypeScript 類型定義
interface MetricData {
  memory: number
  fps: number
  loadTime: number
}

interface LogEntry {
  timestamp: string
  category: string
  message: string
  type: 'info' | 'success' | 'error'
}

interface NetworkRequest {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  status: number
  time: number
}

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
  initConsole()
})

function initConsole(): void {
  const app = document.querySelector('#app') as HTMLElement
  
  if (!app) {
    console.error('找不到 #app 元素')
    return
  }
  
  app.innerHTML = \`
    <div class="console-container">
      <header class="console-header">
        <h1>🎯 Pikka Console</h1>
        <div class="status-indicator" id="status">
          <span class="status-dot"></span>
          <span class="status-text">檢查中...</span>
        </div>
      </header>
      
      <div class="console-grid">
        <!-- 主應用預覽 -->
        <div class="preview-panel">
          <h3>📱 應用預覽</h3>
          <div class="iframe-container">
            <iframe 
              id="app-iframe" 
              src="http://localhost:5173" 
              title="主應用預覽"
              onload="window.handleIframeLoad()"
              onerror="window.handleIframeError()">
            </iframe>
          </div>
        </div>
        
        <!-- 監控面板 -->
        <div class="monitor-panel">
          <h3>📊 效能監控</h3>
          <div class="metrics">
            <div class="metric">
              <span class="metric-label">記憶體使用</span>
              <span class="metric-value" id="memory">-- MB</span>
            </div>
            <div class="metric">
              <span class="metric-label">FPS</span>
              <span class="metric-value" id="fps">-- fps</span>
            </div>
            <div class="metric">
              <span class="metric-label">載入時間</span>
              <span class="metric-value" id="loadTime">-- ms</span>
            </div>
          </div>
        </div>
        
        <!-- 日誌面板 -->
        <div class="logs-panel">
          <h3>📝 監控日誌</h3>
          <div class="log-container" id="logs"></div>
          <button onclick="window.clearLogs()" class="clear-btn">清除日誌</button>
        </div>
        
        <!-- 網路面板 -->
        <div class="network-panel">
          <h3>🌐 網路請求</h3>
          <div class="network-container" id="network"></div>
        </div>
      </div>
    </div>
  \`
  
  // 初始化功能
  startHealthCheck()
  startPerformanceMonitoring()
  startNetworkMonitoring()
}

// 健康檢查
async function startHealthCheck(): Promise<void> {
  const statusElement = document.getElementById('status') as HTMLElement
  
  const checkHealth = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5173', { 
        method: 'HEAD',
        mode: 'no-cors' 
      })
      
      updateStatus('online', '🟢 應用運行中')
      logEvent('健康檢查', '應用正常運行', 'success')
    } catch (error) {
      updateStatus('offline', '🔴 應用離線')
      logEvent('健康檢查', '無法連接到主應用', 'error')
    }
  }
  
  setInterval(checkHealth, 3000)
  await checkHealth() // 立即執行一次
}

// 效能監控
function startPerformanceMonitoring(): void {
  const updateMetrics = (): void => {
    // 記憶體監控
    if ('memory' in performance) {
      const memory = (performance as any).memory
      if (memory?.usedJSHeapSize) {
        const memoryMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        const memoryElement = document.getElementById('memory')
        if (memoryElement) {
          memoryElement.textContent = \`\${memoryMB} MB\`
        }
      }
    }
    
    // FPS 監控 (簡化版)
    const fps = 60 // 預設值，實際需要更複雜的計算
    const fpsElement = document.getElementById('fps')
    if (fpsElement) {
      fpsElement.textContent = \`\${fps} fps\`
    }
    
    // 載入時間
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      if (loadTime > 0) {
        const loadTimeElement = document.getElementById('loadTime')
        if (loadTimeElement) {
          loadTimeElement.textContent = \`\${loadTime} ms\`
        }
      }
    }
  }
  
  setInterval(updateMetrics, 1000)
  updateMetrics() // 立即執行一次
}

// 網路監控 (模擬)
function startNetworkMonitoring(): void {
  // 模擬網路請求日誌
  const networkRequests: NetworkRequest[] = [
    { url: '/api/users', method: 'GET', status: 200, time: 145 },
    { url: '/api/data', method: 'POST', status: 201, time: 89 },
    { url: '/assets/logo.svg', method: 'GET', status: 200, time: 23 }
  ]
  
  setTimeout(() => {
    networkRequests.forEach((req, index) => {
      setTimeout(() => {
        addNetworkLog(req)
      }, index * 2000)
    })
  }, 5000)
}

// 工具函數
function updateStatus(status: 'online' | 'offline' | 'checking', text: string): void {
  const statusElement = document.getElementById('status')
  if (statusElement) {
    statusElement.className = \`status-indicator \${status}\`
    const statusText = statusElement.querySelector('.status-text')
    if (statusText) {
      statusText.textContent = text
    }
  }
}

function logEvent(category: string, message: string, type: LogEntry['type'] = 'info'): void {
  const logsContainer = document.getElementById('logs')
  if (!logsContainer) return
  
  const timestamp = new Date().toLocaleTimeString()
  
  const logEntry = document.createElement('div')
  logEntry.className = \`log-entry \${type}\`
  logEntry.innerHTML = \`
    <span class="log-time">\${timestamp}</span>
    <span class="log-category">[\${category}]</span>
    <span class="log-message">\${message}</span>
  \`
  
  logsContainer.appendChild(logEntry)
  logsContainer.scrollTop = logsContainer.scrollHeight
}

function addNetworkLog(request: NetworkRequest): void {
  const networkContainer = document.getElementById('network')
  if (!networkContainer) return
  
  const timestamp = new Date().toLocaleTimeString()
  
  const networkEntry = document.createElement('div')
  networkEntry.className = 'network-entry'
  networkEntry.innerHTML = \`
    <span class="network-time">\${timestamp}</span>
    <span class="network-method \${request.method.toLowerCase()}">\${request.method}</span>
    <span class="network-url">\${request.url}</span>
    <span class="network-status status-\${Math.floor(request.status/100)}xx">\${request.status}</span>
    <span class="network-time-taken">\${request.time}ms</span>
  \`
  
  networkContainer.appendChild(networkEntry)
}

function clearLogs(): void {
  const logsContainer = document.getElementById('logs')
  if (logsContainer) {
    logsContainer.innerHTML = ''
  }
  logEvent('系統', '日誌已清除', 'info')
}

function handleIframeLoad(): void {
  logEvent('預覽', '主應用載入完成', 'success')
}

function handleIframeError(): void {
  logEvent('預覽', '主應用載入失敗', 'error')
}

// 擴展 Window 介面以支援全域函數
declare global {
  interface Window {
    clearLogs: () => void
    handleIframeLoad: () => void
    handleIframeError: () => void
  }
}

// 將函數掛載到全域 window 物件 (讓 HTML 中的 onclick 可以使用)
window.clearLogs = clearLogs
window.handleIframeLoad = handleIframeLoad
window.handleIframeError = handleIframeError`;
}

export function createMonitorCSS(): string {
  return `/* 監控界面樣式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%);
  color: #e2e8f0;
  min-height: 100vh;
  line-height: 1.6;
}

.console-container {
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.console-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.console-header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  background: linear-gradient(45deg, #60a5fa, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-indicator.online .status-dot { background: #10b981; }
.status-indicator.offline .status-dot { background: #ef4444; }
.status-indicator .status-dot { background: #f59e0b; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.console-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 1rem;
  height: calc(100vh - 140px);
}

.preview-panel {
  grid-row: 1 / -1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-panel h3 {
  margin-bottom: 1rem;
  color: #60a5fa;
  font-size: 1.1rem;
}

.iframe-container {
  width: 100%;
  height: calc(100% - 50px);
  border-radius: 8px;
  overflow: hidden;
  background: #1e293b;
}

#app-iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 8px;
}

.monitor-panel,
.logs-panel,
.network-panel {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.monitor-panel h3,
.logs-panel h3,
.network-panel h3 {
  margin-bottom: 1rem;
  color: #34d399;
  font-size: 1.1rem;
}

.metrics {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.metric-label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.metric-value {
  font-weight: 600;
  color: #e2e8f0;
}

.log-container,
.network-container {
  height: 200px;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0.5rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.85rem;
}

.log-entry,
.network-entry {
  margin-bottom: 0.5rem;
  padding: 0.25rem;
  border-radius: 4px;
}

.log-entry.success { background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10b981; }
.log-entry.error { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; }
.log-entry.info { background: rgba(96, 165, 250, 0.1); border-left: 3px solid #60a5fa; }

.log-time,
.network-time {
  color: #94a3b8;
  font-size: 0.8rem;
}

.log-category {
  color: #60a5fa;
  font-weight: 600;
  margin: 0 0.5rem;
}

.network-method {
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin: 0 0.5rem;
}

.network-method.get { background: #10b981; color: white; }
.network-method.post { background: #3b82f6; color: white; }
.network-method.put { background: #f59e0b; color: white; }
.network-method.delete { background: #ef4444; color: white; }

.network-status {
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-2xx { background: #10b981; color: white; }
.status-3xx { background: #f59e0b; color: white; }
.status-4xx { background: #ef4444; color: white; }
.status-5xx { background: #7c2d12; color: white; }

.clear-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

/* 響應式設計 */
@media (max-width: 1024px) {
  .console-grid {
    grid-template-columns: 1fr;
    grid-template-rows: 2fr 1fr 1fr 1fr;
  }
  
  .preview-panel {
    grid-row: 1;
  }
}`;
}

// 📁 src/commands/init.ts (修正版)
import fs from "fs/promises";

export async function initCommand(): Promise<void> {
  const pikkaDir = ".pikka";
  const srcDir = path.join(pikkaDir, "src");

  try {
    // 創建目錄結構
    await fs.mkdir(pikkaDir, { recursive: true });
    await fs.mkdir(srcDir, { recursive: true });

    // 創建檔案
    await Promise.all([
      // HTML 入口檔案
      fs.writeFile(path.join(pikkaDir, "index.html"), createMonitorHTML()),

      // JavaScript 主檔案
      fs.writeFile(path.join(srcDir, "main.js"), createMonitorJS()),

      // CSS 樣式檔案
      fs.writeFile(path.join(srcDir, "style.css"), createMonitorCSS()),
    ]);

    console.log("✅ Pikka Console 初始化完成！");
    console.log("\n📁 已創建檔案：");
    console.log("   .pikka/index.html     - 監控界面入口");
    console.log("   .pikka/src/main.js    - 主要邏輯");
    console.log("   .pikka/src/style.css  - 界面樣式");
    console.log("\n🚀 使用方式：");
    console.log("   npm run dev:console   - 啟動監控界面");
    console.log("   npm run dev:all       - 同時啟動主應用和監控界面");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ 初始化失敗:", errorMessage);
    throw error;
  }
}

// 📁 src/types/index.ts (新增類型定義檔案)
export interface ConsoleConfig {
  port?: number;
  open?: boolean;
  host?: boolean;
}

export interface MetricData {
  memory: number;
  fps: number;
  loadTime: number;
}

export interface LogEntry {
  timestamp: string;
  category: string;
  message: string;
  type: "info" | "success" | "error";
}

export interface NetworkRequest {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  status: number;
  time: number;
}

export type StatusType = "online" | "offline" | "checking";
