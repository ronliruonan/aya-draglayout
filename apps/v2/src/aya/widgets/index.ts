import AyaExample from "./AyaExample.vue";
import AyaTimer from "./AyaTimer.vue";
import AyaCmdLoading from "./AyaCmdLoading.vue";
import TextWidget from "./TextWidget.vue";
import MetricWidget from "./MetricWidget.vue";
import ContainerWidget from "./ContainerWidget.vue";
export const widgetRegistry = {
  example: {
    label: "样例挂件",
    component: AyaExample,
    defaults: {
      title: "随意拖拽我",
      description: "我是个样例，但可以随意拖拽我",
    },
  },
  timer: {
    label: "计时器",
    component: AyaTimer,
    defaults: { title: "小挂件-计时器" },
  },
  "cmd-loading": {
    label: "CMD 加载",
    component: AyaCmdLoading,
    defaults: { title: "小挂件-CMD加载" },
  },
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
    label: "布局区域",
    component: ContainerWidget,
    defaults: { title: "布局区域", columns: 2 as const },
  },
} as const;
