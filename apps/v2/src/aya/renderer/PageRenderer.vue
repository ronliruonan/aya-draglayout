<script setup lang="ts">
import { computed } from "vue";
import { parsePage } from "../schema";
import RenderNode from "./RenderNode.vue";
const props = defineProps<{ document: unknown }>();
const result = computed(() => {
  try {
    return { page: parsePage(props.document), error: "" };
  } catch {
    return {
      page: null,
      error: "页面数据无效，请检查协议版本、组件类型和属性。",
    };
  }
});
</script>
<template>
  <div v-if="result.page" class="page-renderer">
    <RenderNode v-for="node in result.page.nodes" :key="node.id" :node="node" />
  </div>
  <p v-else role="alert" class="error">{{ result.error }}</p>
</template>
