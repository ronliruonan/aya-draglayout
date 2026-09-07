<script setup lang="ts">
import { computed } from "vue";
import { useWidgetTicker } from "./useWidgetTicker";
defineProps<{ title: string }>();
const symbols = ["\\", "||", "///", "-"];
const ticks = useWidgetTicker(250);
const text = computed(() =>
  ticks.value ? symbols[(ticks.value - 1) % symbols.length] : "",
);
</script>

<template>
  <article class="cmd-widget">
    <h3>{{ title }}</h3>
    <p aria-label="加载中">{{ text }} - {{ text }} - {{ text }}</p>
  </article>
</template>

<style scoped>
.cmd-widget {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  background: #fff;
  color: #303133;
}
h3 {
  margin: 0 0 20px;
  font-size: 16px;
}
p {
  margin: 0;
  padding: 12px 0;
  min-height: 44px;
  box-sizing: border-box;
  font: 14px/20px monospace;
}
</style>
