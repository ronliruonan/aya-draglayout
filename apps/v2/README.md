# AYA v2 — M1

独立的 Vue 3 + TypeScript 桌面布局编辑应用。支持旧版样例提示、计时器、CMD 加载，以及文本、指标卡、容器、拖拽与排序、属性编辑、预览、JSON 导入导出、撤销重做。尚未接入 AI。

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

## 编辑操作

- 点击左侧组件添加到根节点末尾，或拖到画布的放置区。
- 拖动组件标题移动组件；容器可接收子节点。↑/↓ 按钮调整同级顺序。
- 点击画布组件后，在右侧修改属性并点击“应用属性”。
- “导入 / 查看 JSON”打开当前页面数据，编辑后校验导入；失败时保留原页面。
- “导出 JSON”下载 aya-layout.json。“清空”、导入及编辑均可撤销重做。
- Cmd/Ctrl+Z 撤销，Cmd/Ctrl+Shift+Z 重做；输入框内保留原生文本撤销。
- 目前只保存于内存，刷新前请导出。最多保留100步历史。

拖拽使用 SortableJS 模拟模式；将挂件拖入容器的虚线区域。计时器与加载动画的当前进度是运行状态，切换预览、跨容器重新挂载后会重新开始。
