# 白银期货监测系统

一个实时监测白银期货行情的Web应用，提供专业的技术分析和交易信号。

## ✨ 功能特性

- 📊 ECharts专业K线图表
- 🎯 多时间框架信号分析（1分钟/5分钟/15分钟）
- 💹 市场情绪分析（7级情绪分类）
- 📈 实时行情数据（上海期货交易所AG2604）
- 🔔 交易信号提醒
- 📱 响应式设计，支持移动端

## 🚀 在线访问

**部署到Zeabur**: [查看部署指南](./DEPLOYMENT.md)

## 💻 本地运行

### 前端
```bash
cd frontend
npm install
npm run dev
```
访问: http://localhost:5173

### 后端
```bash
cd backend
npm install
npm start
```
服务: http://localhost:3000

## 📖 技术栈

**前端**:
- React 18
- Vite
- ECharts
- WebSocket

**后端**:
- Node.js
- Express
- WebSocket
- SQLite

## 📊 数据源

- 上海期货交易所（SHFE）
- 新浪财经API
- 实时行情推送

## 🌙 交易时间

- **日盘**: 9:00-15:00
- **夜盘**: 21:00-次日2:30

## 📝 许可证

MIT License

## 👨‍💻 作者

您的名字

---

**⭐ 如果觉得有用，请给个Star！**
