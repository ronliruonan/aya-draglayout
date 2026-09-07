# aya-draglayout

面向桌面的开源可视化拖拽布局编辑器。v2 基于 Vue 3、TypeScript 和 Vite，以可校验的 JSON 描述页面，支持递归布局、业务挂件和可撤销的编辑操作。

## 在线演示与版本

| 版本 | 地址 | 状态 |
| --- | --- | --- |
| v2 | [新版演示](https://ronliruonan.github.io/aya-draglayout/v2/) | 发布配置已准备，首次部署后可访问 |
| v1 | [旧版演示](https://ronliruonan.github.io/aya-draglayout/) | 保留原地址，供体验与对比 |

v2 是当前开发版本。旧版 Vue 2 工程与已构建的 `docs/` 独立保留，不需要安装旧版依赖即可开发或发布 v2。当前只考虑桌面使用，不做移动端适配。

## v2 功能

- 单列、双列、三列布局；选中布局后可继续添加嵌套子布局。
- 样例挂件、计时器、CMD 加载、文本及指标卡。
- 拖入组件、同级排序、跨布局移动与属性编辑。
- 只读预览、JSON 导入导出、撤销和重做。
- 模拟生成：输入列数与挂件关键词，先校验并预览候选，确认后替换页面，支持撤销恢复。

模拟生成使用本地规则，**尚未接入真实 AI**，不需要 API Key，也不发送模型请求。页面保存在内存中，刷新前请导出 JSON；最多保留 100 步编辑历史。

## 本地运行 v2

要求 Node.js `^20.19.0` 或 `>=22.12.0`，CI 使用 Node.js 22。

```sh
cd apps/v2
npm ci
npm run dev
```

打开 http://127.0.0.1:5173/ 。

```sh
npm test
npm run build
```

构建结果位于 `apps/v2/dist/`。更多操作说明及安装问题见 [v2 README](apps/v2/README.md)。

## 项目结构

| 目录 | 职责 |
| --- | --- |
| `apps/v2/src/aya/schema` | 页面协议与运行时校验 |
| `apps/v2/src/aya/core` | 编辑命令与撤销重做 |
| `apps/v2/src/aya/widgets` | 挂件与固定注册表 |
| `apps/v2/src/aya/renderer` | 独立只读渲染器 |
| `apps/v2/src/aya/editor` | 拖拽与选择交互 |
| `apps/v2/src/aya/ai` | Provider 边界、模拟生成与候选弹窗 |
| `src/`、`public/` | 旧版 Vue 2 源码 |
| `docs/` | 保留的旧版演示构建产物 |

阶段范围见 [v2-scope](design/v2-scope.md)，模块约束见 [v2-architecture](design/v2-architecture.md)。

## GitHub Pages 发布

工作流先测试并构建 v2，再将旧版 `docs/` 放到站点根目录、新版构建放到 `/v2/`。旧版路由和资源路径保持不变，不引入新版路由。

当前由 `codex/v2` 分支部署；`master` 和拉取请求仅构建验证。首次启用步骤、预览与回退方法见 [发布说明](design/github-pages.md)。

## OrcaRouter 接入计划

计划将 OrcaRouter 作为可选模型服务提供商，让用户配置自己的 API Key。当前已完成 Provider 抽象与模拟生成闭环，真实服务接入仍待实现。

[了解 OrcaRouter（推荐链接）](https://www.orcarouter.ai/ref/ref_38c9597fe1529a31aaec)。通过该链接使用服务，项目维护者可能获得分成；这不代表当前演示已由 OrcaRouter 提供模型能力。

## 旧版开发

旧版使用 Vue 2、Vue.Draggable 与 Vue 动态组件，依赖较早的 Node Sass 工具链，需要匹配旧依赖的运行环境。根目录现有命令为 `npm start`、`npm run build`、`npm run lint` 和 `npm run test:e2e`；其中构建会覆盖 `docs/`，开发 v2 时使用 `apps/v2` 内的命令。

## License

[MIT](LICENSE)
