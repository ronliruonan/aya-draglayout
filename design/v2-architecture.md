# v2 模块边界

模块先放在 apps/v2/src/aya 下，按阶段逐步实现。

| 模块 | 职责 | 依赖约束 | 阶段 |
| --- | --- | --- | --- |
| schema | 可序列化页面协议、版本、运行时校验 | 不依赖 Vue，不包含组件对象、密钥 | M0 |
| widgets | 组件实现、固定注册表、默认属性 | 类型来自 schema；不依赖 editor | M0 |
| renderer | 根据校验后的页面数据与注册表渲染 | 不依赖 editor、core 或 AI | M0 |
| core | 页面状态、编辑命令、事务、撤销重做 | 不依赖 Vue、大模型；以 schema 校验边界 | M1 |
| editor | 可视化交互与属性编辑 | 通过 core 修改；复用 renderer/widgets | M1 |
| ai | Provider 适配与候选结果生成 | 输出 schema 数据，禁止直接写页面状态 | M2 |

M0 的 PageRenderer 接收 unknown，在渲染边界校验；拒绝任意组件名称和未知属性。文本使用 Vue 插值，不使用 v-html。容器列数通过协议限制；renderer 可被独立嵌入。当前只面向桌面端，不提供手机布局或窄屏切换。

主应用 App.vue 仅为 M0 演示壳。示例数据放在 sample.ts；指标均为明确标注的示例，不代表真实业务或分成。

旧版 rows/zones/widgets 不是 v2 协议，不静默视作新版本；如需迁移，在 M1 单独定义转换器与测试。M0 不改旧版路由和 GitHub Pages 发布。

## M1 core 命令契约

`createEditor(initial)` 持有经过校验的独立页面快照。`getDocument()` 返回副本，Vue 界面不能通过引用直接修改 core。`execute` 先在副本上运行命令，通过 `parsePage` 后才写入历史。

命令包括 insert、remove、move、updateProps、rename、replace 和 clear。移动索引以源节点移除后的目标列表为准，UI 的拖拽放置区负责转换同级索引；不能将容器移入自身或后代。undo/redo 同时恢复页面名称和节点数据。

EditorTree 为编辑态递归视图，使用相同 widgets；仅通过事件交给 App 调用 core。纯预览继续使用独立 PageRenderer。选择状态与未应用的表单草稿属于 editor，不写入页面 JSON。
