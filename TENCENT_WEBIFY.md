# 腾讯云Webify部署指南

## 🚀 腾讯云云开发 - 完全免费

**优势**：
- ✅ 完全免费（每月免费额度充足）
- ✅ 国内访问速度快
- ✅ 微信登录，操作简单
- ✅ 自动HTTPS
- ✅ 支持自定义域名

---

## 📋 部署步骤

### 准备工作

**访问**: https://webify.cloudbase.net

**登录方式**: 微信扫码登录

---

### 第一步：部署后端

1. **进入云开发控制台**
   - 登录后，点击"新建应用"
   - 选择"从代码仓库导入"

2. **连接GitHub**
   - 授权GitHub访问
   - 选择仓库: `sydm1995/silver-futures-monitor`
   - 分支: `main`

3. **配置后端服务**
   ```
   应用名称: silver-backend
   框架: Node.js
   根目录: backend
   构建命令: npm install
   启动命令: npm start
   端口: 3000
   ```

4. **环境变量**
   ```
   NODE_ENV=production
   PORT=3000
   ```

5. **点击"部署"**
   - 等待3-5分钟
   - 部署成功后获取URL
   - 例如: `https://silver-backend-xxxxx.ap-shanghai.app.tcloudbase.com`

---

### 第二步：部署前端

1. **新建应用**
   - 再次点击"新建应用"
   - 选择"从代码仓库导入"
   - 选择同一个仓库

2. **配置前端服务**
   ```
   应用名称: silver-frontend
   框架: Vite
   根目录: frontend
   构建命令: npm run build
   输出目录: dist
   ```

3. **环境变量**（重要！）
   ```
   VITE_API_URL=https://silver-backend-xxxxx.ap-shanghai.app.tcloudbase.com
   ```
   **注意**: 将URL替换为第一步获取的后端URL

4. **点击"部署"**
   - 等待2-3分钟
   - 部署成功后获取URL
   - 例如: `https://silver-frontend-xxxxx.ap-shanghai.app.tcloudbase.com`

---

## ✅ 部署完成

**您的应用已上线！**

- **前端地址**: https://silver-frontend-xxxxx.ap-shanghai.app.tcloudbase.com
- **后端地址**: https://silver-backend-xxxxx.ap-shanghai.app.tcloudbase.com

**分享给朋友**:
```
我做了一个白银期货监测系统！
实时K线、技术分析、交易信号
访问: https://silver-frontend-xxxxx.ap-shanghai.app.tcloudbase.com
```

---

## 🎯 腾讯云Webify特点

### 免费额度（每月）
- ✅ 流量: 5GB
- ✅ 存储: 1GB
- ✅ 构建时长: 400分钟
- ✅ 函数调用: 10万次

**对于个人项目完全够用！**

### 优势
1. **国内访问快** - 服务器在国内，延迟低
2. **稳定可靠** - 腾讯云基础设施
3. **无需休眠** - 不像Render会休眠
4. **自动部署** - Git推送自动触发部署

---

## 🔧 后续更新

**更新代码**:
```bash
# 在本地修改代码后
git add .
git commit -m "更新说明"
git push

# Webify会自动重新部署
```

---

## 📱 绑定自定义域名（可选）

如果您有自己的域名：

1. 在Webify控制台点击"域名管理"
2. 添加自定义域名
3. 配置DNS解析（按照提示操作）
4. 等待SSL证书自动签发

---

## ⚠️ 注意事项

### 实名认证
- 首次使用可能需要实名认证
- 使用微信扫码即可完成
- 完全免费，无需绑卡

### WebSocket支持
- Webify完全支持WebSocket
- 无需额外配置

### 数据库
- 当前使用SQLite
- Webify会自动持久化存储

---

## 💡 常见问题

**Q: 需要付费吗？**
A: 完全免费，免费额度对个人项目足够

**Q: 需要备案吗？**
A: 使用腾讯云提供的域名无需备案，自定义域名需要备案

**Q: 访问速度如何？**
A: 国内访问速度很快，服务器在上海

**Q: 如何查看日志？**
A: 在Webify控制台可以查看构建日志和运行日志

---

## 📞 获取帮助

**官方文档**: https://cloud.tencent.com/document/product/1243

**遇到问题？**
- 查看构建日志
- 检查环境变量配置
- 确认代码已推送到GitHub

---

## 🎉 总结

**腾讯云Webify优势**:
- ✅ 100% 免费
- ✅ 国内访问快
- ✅ 操作简单
- ✅ 稳定可靠

**非常适合国内用户使用！**
