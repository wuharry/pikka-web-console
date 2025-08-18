// src/server/services/cors-service.ts
import type { Context, Next } from 'hono';

/**
 * CORS 中間件
 * 允許跨域請求，主要用於前端開發環境
 */
export async function corsMiddleware(c: Context, next: Next) {
  // 在開發環境允許所有來源
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  if (isDevelopment) {
    c.header('Access-Control-Allow-Origin', '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }

  // 處理預檢請求
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }

  await next();
}
