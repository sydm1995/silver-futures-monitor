# Vercel + Render 免费部署指南

## 🎉 完全免费方案

**前端**: Vercel（免费）  
**后端**: Render（免费）

---

## 📋 部署步骤

### 第一步：部署后端到Render

1. **访问Render**: https://render.com

2. **注册/登录**
   - 使用GitHub账号登录

3. **创建Web Service**
   - 点击 "New +" → "Web Service"
   - 选择 "Connect a repository"
   - 选择 `sydm1995/silver-futures-monitor`

4. **配置服务**
   ```
   Name: silver-backend
   Region: Singapore (离中国最近)
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **等待部署**（约3-5分钟）

6. **获取后端URL**
   - 部署成功后会显示URL
   - 例如: `https://silver-backend.onrender.com`
   - **复制这个URL，下一步需要用**

---

### 第二步：部署前端到Vercel

1. **访问Vercel**: https://vercel.com

2. **注册/登录**
   - 使用GitHub账号登录

3. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 `sydm1995/silver-futures-monitor`
   - 点击 "Import"

4. **配置项目**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

5. **配置环境变量**
   - 点击 "Environment Variables"
   - 添加变量:
     ```
     Name: VITE_API_URL
     Value: https://silver-backend.onrender.com
     ```
   - **注意**: 将URL替换为第一步获取的后端URL

6. **点击Deploy**

7. **等待部署**（约2-3分钟）

8. **获取访问链接**
   - 部署成功后会显示URL
   - 例如: `https://silver-monitor.vercel.app`

---

## ✅ 部署完成

**您的应用已上线！**

- **前端地址**: https://your-app.vercel.app
- **后端地址**: https://silver-backend.onrender.com

**分享给朋友**:
```
我做了一个白银期货监测系统！
实时K线、技术分析、交易信号
访问这个链接: https://your-app.vercel.app
```

---

## ⚠️ 重要提示

### Render免费版特点

1. **休眠机制**
   - 15分钟无访问会自动休眠
   - 首次访问需等待10-30秒唤醒
   - 唤醒后运行正常

2. **解决方案**
   - 使用UptimeRobot等服务定期ping后端
   - 或者升级到付费版（$7/月）

3. **免费额度**
   - 750小时/月免费运行时间
   - 足够个人使用

---

## 🔧 后续更新

**更新代码**:
```bash
# 在本地修改代码后
git add .
git commit -m "更新说明"
git push

# Vercel和Render会自动重新部署
```

---

## 📱 访问测试

部署完成后:
1. 访问前端URL
2. 检查是否能看到K线图
3. 查看是否有实时数据
4. 测试所有功能

**如果遇到问题**:
- 检查Render后端日志
- 检查Vercel部署日志
- 确认环境变量配置正确

---

## 💰 费用说明

- **Vercel**: 100% 免费
- **Render**: 100% 免费
- **总费用**: ￥0

**完全免费，无需信用卡！**
