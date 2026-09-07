<script setup lang="ts">
import type { PageNode } from "../schema";
import { widgetRegistry } from "../widgets";
defineProps<{ node: PageNode }>();
</script>
<template>
  <component :is="widgetRegistry[node.type].component" v-bind="node.props"
    ><template v-if="node.type === 'container'"
      ><RenderNode
        v-for="child in node.children"
        :key="child.id"
        :node="child" /></template
  ></component>
</template>
