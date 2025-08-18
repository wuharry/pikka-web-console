// src/main.ts - 新的入口點重定向到重構後的結構
export * from './client/app/main';

// 保持向後兼容性，直接執行應用
import './client/app/main';
