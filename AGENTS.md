# Repository Guidelines

## Project Structure & Module Organization
- `app/`：Next.js App Router 入口。页面在 `app/page.jsx`，全局布局在 `app/layout.jsx`，全局样式在 `app/globals.css`。
- `app/components/`：可复用组件（例如 `Announcement.jsx`）。
- 根目录配置：`next.config.js`、`vercel.json`、`package.json`。
- 构建产物：`npm run build` 后输出到 `out/`（静态导出）。

## Build, Test, and Development Commands
- `npm install`：安装依赖。
- `npm run dev`：启动本地开发服务器（默认 http://localhost:3000）。
- `npm run build`：生产构建并生成静态文件到 `out/`。
- `npm run start`：以生产模式启动（需先 build）。

## Coding Style & Naming Conventions
- 语言：React + Next.js（JSX）。
- 缩进：2 空格，保持现有文件风格。
- 字符串：项目中以单引号为主，新增代码请保持一致。
- 组件命名：`PascalCase`（如 `Announcement`），函数与变量使用 `camelCase`。
- 样式：集中在 `app/globals.css`，避免新增零散 CSS 文件。

## Testing Guidelines
- 当前未配置自动化测试或测试脚本。
- 变更后请进行人工回归：添加/删除基金、刷新频率设置、移动端布局与动画效果。

## Commit & Pull Request Guidelines
- 提交信息遵循短前缀 + 简述，例如：`add: 添加公告`、`fix: 解决刷新导致的数据重复问题`。
- 建议在 PR 描述中说明变更动机、影响范围与本地验证步骤；若涉及 UI，附上截图。

## Security & Configuration Tips
- 项目为纯前端，数据来自公开接口（JSONP/脚本注入）。避免提交任何密钥或私有凭证。
- 若新增数据源，请在 README 中补充来源与用途说明。
