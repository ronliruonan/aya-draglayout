import TextWidget from "./TextWidget.vue";
import MetricWidget from "./MetricWidget.vue";
import ContainerWidget from "./ContainerWidget.vue";
export const widgetRegistry = {
  text: {
    label: "文本",
    component: TextWidget,
    defaults: { text: "一段文字", tone: "body" as const },
  },
  metric: {
    label: "指标卡",
    component: MetricWidget,
    defaults: { label: "指标", value: "0", detail: "指标说明" },
  },
  container: {
    label: "容器",
    component: ContainerWidget,
    defaults: { title: "分组", columns: 2 as const },
  },
} as const;
