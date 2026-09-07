# AYA v2 — M0

独立的 Vue 3 + TypeScript 布局预览应用。当前可渲染文本、指标卡、容器，查看 JSON；仅面向桌面端。尚不包含拖拽编辑、导入导出、撤销重做或 AI 服务。

要求 Node ^20.19.0 或 >=22.12.0。

```sh
cd apps/v2
npm ci
npm run dev
npm run test
npm run build
```

默认开发地址 http://127.0.0.1:5173，生产构建输出到本目录 dist，使用相对资源路径。旧版根工程与 docs 不受影响。

- `src/aya/schema`：页面协议及校验测试
- `src/aya/widgets`：固定组件注册表与默认属性
- `src/aya/renderer`：可嵌入只读渲染器
- `src/sample.ts`：固定示例页面
- `../../design/v2-scope.md`：阶段与验收
- `../../design/v2-architecture.md`：模块边界

如本机默认 npm 缓存不可写，可在 npm 命令后加 `--cache /private/tmp/aya-npm-cache`，不需要调整系统目录权限。

若 npm 10 安装时遇到 `edgesOut` 解析错误，可临时使用 `npx --yes npm@11 ci`。项目已包含锁文件；不需要全局升级 npm。
