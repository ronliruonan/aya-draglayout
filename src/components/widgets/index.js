// 暂时没有办法一次全部局部加载多个组件
import AyaTimer from "@/components/widgets/AyaTimer.vue";
import AyaExample from "@/components/widgets/AyaExample.vue";
import AyaCmdLoading from "@/components/widgets/AyaCmdLoading.vue";
import AyaHello from "@/components/widgets/AyaHello.vue";

import Widget from "@/components/widgets/Widget.js";

export default {
  components: {
    AyaExample,
    AyaTimer,
    AyaCmdLoading,
    AyaHello
  },
  widgets: [
    new Widget("AyaExample", "小挂件-样例"),
    new Widget("AyaTimer", "小挂件-计时器"),
    new Widget("AyaCmdLoading", "小挂件-CMD加载"),
    new Widget("AyaHello", "挂件-Hello")
  ]
};
