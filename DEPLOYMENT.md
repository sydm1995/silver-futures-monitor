# 白银期货监测系统 - 国内部署指南

## 🚀 Zeabur 部署（推荐）

### 优势
- ✅ 完全免费
- ✅ 国内访问速度快
- ✅ 中文界面，操作简单
- ✅ 自动配置HTTPS
- ✅ 支持自定义域名

### 部署步骤

#### 1. 准备工作
- 注册GitHub账号（如果没有）
- 将代码上传到GitHub仓库

#### 2. 部署到Zeabur

**访问**: https://zeabur.com

**步骤**:
1. 使用GitHub账号登录
2. 点击"创建新项目"
3. 选择"从GitHub导入"
4. 选择您的仓库

**部署前端**:
- 服务名称: `silver-frontend`
- 根目录: `/frontend`
- 构建命令: `npm install && npm run build`
- 输出目录: `dist`
- 端口: 自动检测

**部署后端**:
- 服务名称: `silver-backend`
- 根目录: `/backend`
- 启动命令: `npm start`
- 端口: 3000

#### 3. 配置环境变量

**后端环境变量**:
```
NODE_ENV=production
PORT=3000
```

**前端环境变量**:
```
VITE_API_URL=https://silver-backend.zeabur.app
```

#### 4. 获取访问链接

部署完成后，Zeabur会自动生成：
- 前端: `https://silver-frontend.zeabur.app`
- 后端: `https://silver-backend.zeabur.app`

**分享给朋友**: 直接发送前端链接即可！

---

## 🎯 其他国内方案

### 方案2: 腾讯云Webify（免费）

**访问**: https://webify.cloudbase.net

**特点**:
- 腾讯云官方产品
- 每月免费额度充足
- 国内访问极快
- 支持自定义域名

**部署**:
1. 微信扫码登录
2. 导入GitHub仓库
3. 自动构建部署

### 方案3: 阿里云云开发平台（免费）

**访问**: https://workbench.aliyun.com

**特点**:
- 阿里云官方
- 免费托管
- 国内CDN加速

---

## 📱 快速部署检查清单

- [ ] 代码已上传到GitHub
- [ ] 注册Zeabur账号
- [ ] 创建新项目
- [ ] 导入GitHub仓库
- [ ] 配置环境变量
- [ ] 等待自动部署（约3-5分钟）
- [ ] 测试访问链接
- [ ] 分享给朋友

---

## ⚠️ 注意事项

1. **WebSocket配置**: 
   - Zeabur自动支持WebSocket
   - 无需额外配置

2. **数据库**:
   - 当前使用SQLite
   - Zeabur会自动持久化

3. **域名**（可选）:
   - 可以绑定自己的域名
   - 在Zeabur项目设置中配置

---

## 🎉 部署完成后

您将获得：
- 一个可以分享的网址
- 24小时在线访问
- 自动HTTPS加密
- 全球CDN加速

**示例分享**:
```
嘿，我做了一个白银期货监测系统！
访问这个链接试试：https://silver-monitor.zeabur.app
```

---

## 💡 需要帮助？

如果部署过程中遇到问题，可以：
1. 查看Zeabur官方文档
2. 检查构建日志
3. 联系我获取帮助
