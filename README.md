# 时间戳转换工具

一个基于 `Vue 3 + TypeScript + Vite` 的时间戳转换工具，支持：

- 通过日期时间选择器把具体时间转换成秒级、毫秒级时间戳
- 输入秒级或毫秒级时间戳，转换成可读日期时间
- 在浏览器本地时区和 `UTC` 之间切换
- 复制转换结果，并在浏览器中保存最近一次输入和偏好

## 开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## 部署到 GitHub Pages

仓库已包含 GitHub Actions 工作流：

- 推送到 `main` 分支后自动构建并部署
- 部署产物来自 `dist/`
- Vite 会在 GitHub Actions 中自动使用仓库名作为 Pages 基路径

首次启用时需要在 GitHub 仓库设置中确认：

1. 打开 `Settings -> Pages`
2. 在 `Build and deployment` 中将 `Source` 设置为 `GitHub Actions`
