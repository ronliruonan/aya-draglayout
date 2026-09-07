<script setup lang="ts">
import { useWidgetTicker } from "./useWidgetTicker";
defineProps<{ title: string }>();
const seconds = useWidgetTicker(1000);
</script>

<template>
  <article class="timer-widget">
    <h4>{{ title }}</h4>
    <p>
      出生于 <em>{{ seconds }}s</em> 前
    </p>
  </article>
</template>

<style scoped>
.timer-widget {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 20px;
  background: #fff;
  color: #303133;
}
h4 {
  margin: 0 0 20px;
  font-size: 14px;
}
p {
  margin: 0;
  padding: 12px 0;
  font-size: 14px;
}
em {
  color: #f56c6c;
}
</style>
