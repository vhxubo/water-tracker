# 水量记录 💧

一个轻量的存水记录小工具：记录**哪里**（车里、冷藏层、冷冻层……任意自定义位置）存了**什么水**、**多少瓶**、**每瓶多少毫升**、**什么用途**，以及**记录时间**。

纯前端应用，无后端、无数据库，数据保存在浏览器 localStorage 里，支持导出 / 导入 JSON 备份。构建产物是纯静态文件，可一键部署到 GitHub Pages、Cloudflare Pages、Vercel、Netlify 等任何静态托管平台。

## 功能

- **库存清单**：按位置分组展示，顶部汇总总瓶数和总毫升数（附升数），各位置在水位条中按占比显示
- **快捷加减**：每条记录一键 ±1 瓶，自动记入历史
- **内置预设**：农夫山泉、怡宝、百岁山、娃哈哈、依云、圣培露等常见规格，点选即填；用途预设（日常饮用 / 应急备用 / 运动补水……）也支持自定义
- **自定义位置**：任意添加位置（名称 + 图标），可重命名、排序、删除，首次使用预置「车里 / 冷藏层 / 冷冻层」
- **历史流水**：放入 / 补入 / 取用 / 修改 / 删除 全部留痕，按天分组
- **数据备份**：一键导出 JSON、导入恢复（含格式校验）、清空数据
- **移动优先**：手机上体验最佳，支持添加到主屏幕（PWA manifest）、深色模式跟随系统

## 本地开发

```bash
npm install
npm run dev      # 开发
npm run build    # 构建到 dist/
npm run preview  # 预览构建产物
```

## 部署

构建使用相对路径（`base: './'`），同一份产物部署到任意平台无需改动。

### GitHub Pages（自动）

仓库已内置 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)：

1. 把仓库推到 GitHub
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**
3. 之后每次 push 到 `main` 自动构建发布

### Cloudflare Pages

1. Cloudflare Dashboard → Workers & Pages → Create → Pages → **Connect to Git**
2. 选择本仓库，构建配置：
   - Framework preset: **Vite**（或 None）
   - Build command: `npm run build`
   - Build output directory: `dist`
3. 保存后每次 push 自动部署

也可以不开仓库：`npm run build` 后直接把 `dist` 目录拖进 Cloudflare Pages 的 **Direct Upload**。

### Vercel / Netlify

导入仓库即可，两者都会自动识别 Vite（构建命令 `npm run build`，输出目录 `dist`），零配置。

## 数据说明

- 数据仅存于**当前浏览器**的 localStorage（键 `water-tracker:v1`），不上传任何服务器
- 换浏览器 / 换设备 / 清理浏览器数据前，请先在 **设置 → 导出备份（JSON）**
- 导入备份会覆盖当前全部数据

## 技术栈

Vue 3（`<script setup>`）· Vite 7 · Tailwind CSS v4 · PWA manifest · 无其他运行时依赖
