import { parsePage } from "./aya/schema";

export const samplePage = parsePage({
  version: 1,
  title: "挂件布局",
  nodes: [
    {
      id: "widgets",
      type: "container",
      props: { title: "常用挂件", columns: 3 },
      children: [
        {
          id: "example",
          type: "example",
          props: {
            title: "示例挂件",
            description: "这是一个示例组件，可在右侧修改标题和说明。",
          },
        },
        { id: "timer", type: "timer", props: { title: "小挂件-计时器" } },
        { id: "loading", type: "cmd-loading", props: { title: "加载动画" } },
      ],
    },
  ],
});
