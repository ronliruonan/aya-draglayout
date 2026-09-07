import { parsePage } from "./aya/schema";
export const samplePage = parsePage({
  version: 1,
  title: "工作概览",
  nodes: [
    {
      id: "intro",
      type: "text",
      props: { text: "让想法，拥有自己的布局。", tone: "heading" },
    },
    {
      id: "description",
      type: "text",
      props: {
        text: "从一份页面数据出发，将内容组合成清晰、有序的界面。这里的每个元素，都由同一份布局协议渲染。",
        tone: "body",
      },
    },
    {
      id: "overview",
      type: "container",
      props: { title: "项目一览", columns: 3 },
      children: [
        {
          id: "projects",
          type: "metric",
          props: {
            label: "进行中的项目",
            value: "12",
            detail: "示例数据 · 本月",
          },
        },
        {
          id: "components",
          type: "metric",
          props: {
            label: "可用基础组件",
            value: "03",
            detail: "文本 / 指标卡 / 容器",
          },
        },
        {
          id: "progress",
          type: "metric",
          props: {
            label: "布局完成度",
            value: "86%",
            detail: "示例数据 · 持续完善",
          },
        },
      ],
    },
    {
      id: "note",
      type: "container",
      props: { title: "留一点空间，给下一个想法", columns: 1 },
      children: [
        {
          id: "note-text",
          type: "text",
          props: {
            text: "这是 v2 的第一块画布。先让内容正确呈现，再让编排自由发生。",
            tone: "body",
          },
        },
      ],
    },
  ],
});
