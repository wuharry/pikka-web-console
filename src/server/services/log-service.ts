// src/server/services/log-service.ts
import { Hono } from 'hono';
import type { ConsoleType } from '../../shared/types/console.types';

interface LogEntry {
  id: string;
  type: ConsoleType;
  message: string;
  timestamp: string;
  metadata?: any;
}

// 簡單的內存存儲（生產環境應該使用數據庫）
const logStorage = new Map<string, LogEntry>();

export const logService = new Hono();

/**
 * 獲取所有 logs
 */
logService.get('/', (c) => {
  const logs = Array.from(logStorage.values())
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return c.json({
    success: true,
    data: logs,
    count: logs.length
  });
});

/**
 * 根據類型獲取 logs
 */
logService.get('/type/:type', (c) => {
  const type = c.req.param('type') as ConsoleType;
  
  if (!['log', 'error', 'warn', 'info'].includes(type)) {
    return c.json({ 
      success: false, 
      error: 'Invalid log type' 
    }, 400);
  }

  const logs = Array.from(logStorage.values())
    .filter(log => log.type === type)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return c.json({
    success: true,
    data: logs,
    count: logs.length,
    type
  });
});

/**
 * 新增 log 條目
 */
logService.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { type, message, metadata } = body;

    if (!type || !message) {
      return c.json({ 
        success: false, 
        error: 'Type and message are required' 
      }, 400);
    }

    const logEntry: LogEntry = {
      id: generateId(),
      type,
      message,
      timestamp: new Date().toISOString(),
      metadata
    };

    logStorage.set(logEntry.id, logEntry);

    return c.json({
      success: true,
      data: logEntry
    }, 201);

  } catch (error) {
    return c.json({ 
      success: false, 
      error: 'Invalid JSON payload' 
    }, 400);
  }
});

/**
 * 清空所有 logs
 */
logService.delete('/', (c) => {
  const count = logStorage.size;
  logStorage.clear();
  
  return c.json({
    success: true,
    message: `Cleared ${count} log entries`
  });
});

/**
 * 根據 ID 刪除特定 log
 */
logService.delete('/:id', (c) => {
  const id = c.req.param('id');
  
  if (logStorage.has(id)) {
    logStorage.delete(id);
    return c.json({
      success: true,
      message: `Log entry ${id} deleted`
    });
  }
  
  return c.json({
    success: false,
    error: 'Log entry not found'
  }, 404);
});

/**
 * 生成簡單的 UUID
 */
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
