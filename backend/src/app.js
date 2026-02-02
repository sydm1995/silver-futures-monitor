import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import WSServer from './websocket/wsServer.js';
import db from './database/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// 创建HTTP服务器
const server = createServer(app);

// 初始化WebSocket服务器
const wsServer = new WSServer(server);

// 启动服务器
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║   白银期货实时监测与分析系统 - 后端服务已启动          ║
╠════════════════════════════════════════════════════════╣
║   HTTP服务: http://localhost:${PORT}                    ║
║   WebSocket: ws://localhost:${PORT}                     ║
║   数据库: SQLite (已初始化)                            ║
║   数据源: 上海期货交易所 (SHFE) 白银期货 AG            ║
╚════════════════════════════════════════════════════════╝
  `);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n正在关闭服务器...');
    wsServer.stop();
    db.close();
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

export default app;
