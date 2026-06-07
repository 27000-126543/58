import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { loadDatabase, saveDatabase, stopAutoSave, db } from './db/index.js';
import { registerRoutes } from './routes/index.js';
import setupWebSocket from './ws/broadcast.js';
import { startDataStream, eventBus } from './engine/dataStream.js';
import { startAlertEngine } from './engine/alertEngine.js';
import { startScheduledTasks } from './engine/scheduler.js';
import { getCurrentUser } from './utils/permissions.js';
import { seed } from './db/seed.js';

const app = express();
const server = createServer(app);

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  (req as any).user = getCurrentUser(req);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

registerRoutes(app);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API 端点不存在' });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('服务器错误:', err);
  res.status(500).json({ error: err.message || '服务器内部错误' });
});

let stopDataStream: (() => void) | null = null;
let stopAlertEngine: (() => void) | null = null;

function shutdown(): void {
  console.log('\n🛑 正在关闭服务...');

  if (stopDataStream) {
    stopDataStream();
    console.log('✅ 数据流已停止');
  }

  if (stopAlertEngine) {
    stopAlertEngine();
    console.log('✅ 预警引擎已停止');
  }

  stopAutoSave();
  saveDatabase();
  console.log('✅ 数据库已保存');

  server.close(() => {
    console.log('✅ HTTP 服务器已关闭');
    process.exit(0);
  });

  setTimeout(() => {
    console.log('⚠️  强制退出');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

const PORT = Number(process.env.PORT) || 3002;

function start(): void {
  console.log('🚀 主题公园智能分析平台后端服务启动中...');
  console.log('=============================================');

  loadDatabase();

  if (!db.zones || db.zones.length === 0) {
    console.log('📦 数据库为空，正在初始化种子数据...');
    seed();
  }

  setupWebSocket(server);
  console.log('✅ WebSocket 服务已挂载在 /ws');

  stopDataStream = startDataStream();
  console.log('✅ 实时数据流已启动');

  (globalThis as any).__alertEventBus = eventBus;
  stopAlertEngine = startAlertEngine(eventBus);
  console.log('✅ 预警引擎已启动');

  startScheduledTasks();
  console.log('✅ 定时任务已启动');

  server.listen(PORT, () => {
    console.log('=============================================');
    console.log(`后端服务运行在 http://localhost:${PORT}`);
    console.log(`WebSocket 运行在 ws://localhost:${PORT}/ws`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
    console.log('=============================================');
  });
}

start();
