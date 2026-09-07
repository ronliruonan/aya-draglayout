<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import Sortable from "sortablejs";
import { allowDrop } from "./dragGuard";
import type { PageNode } from "../schema";
import { widgetRegistry } from "../widgets";
import ContainerWidget from "../widgets/ContainerWidget.vue";
const props = defineProps<{
  nodes: PageNode[];
  parentId: string | null;
  selectedId: string | null;
}>();
const emit = defineEmits<{
  select: [id: string];
  dropNode: [data: string, parentId: string | null, index: number];
  reorder: [id: string, parentId: string | null, index: number];
}>();
const root = ref<HTMLElement | null>(null);
let sortable: Sortable | undefined;
// Sortable previews changes in the DOM; restore that preview before the core
// command updates Vue's data, so Vue remains the sole owner of rendered order.
function finish(event: Sortable.SortableEvent) {
  const item = event.item;
  const index = event.newDraggableIndex ?? 0;
  const oldIndex = event.oldDraggableIndex ?? 0;
  const widget = item.dataset.widget;
  const id = item.dataset.nodeId;
  const same = event.from === event.to;
  if (widget) {
    item.remove();
  } else {
    item.remove();
    const siblings = Array.from(event.from.children).filter((child) =>
      child.matches(".tree-item"),
    );
    event.from.insertBefore(item, siblings[oldIndex] ?? null);
  }
  if (widget) {
    emit("dropNode", JSON.stringify({ widget }), props.parentId, index);
    return;
  }
  if (id) {
    // App consumes pre-removal placement indexes; Sortable supplies final index.
    const placement = same && oldIndex < index ? index + 1 : index;
    emit("dropNode", JSON.stringify({ id }), props.parentId, placement);
  }
}
onMounted(() => {
  if (!root.value) return;
  sortable = new Sortable(root.value, {
    group: { name: "aya", pull: true, put: true },
    animation: 120,
    draggable: ".tree-item",
    handle: ".drag-handle",
    forceFallback: true,
    fallbackOnBody: true,
    fallbackTolerance: 4,
    swapThreshold: 0.65,
    invertSwap: true,
    ghostClass: "drag-ghost",
    chosenClass: "drag-chosen",
    fallbackClass: "drag-floating",
    emptyInsertThreshold: 25,
    onAdd: finish,
    onUpdate: finish,
    onMove: allowDrop,
  });
});
onBeforeUnmount(() => sortable?.destroy());
</script>
<template>
  <div ref="root" class="editor-tree" :data-parent="parentId ?? 'root'">
    <section
      v-for="(node, index) in nodes"
      :key="node.id"
      class="tree-item editable-node"
      :class="{ selected: selectedId === node.id }"
      :data-node-id="node.id"
      @click.stop="emit('select', node.id)"
    >
      <div class="node-tools">
        <button
          class="drag-handle"
          :aria-label="`拖动 ${widgetRegistry[node.type].label} ${node.id}`"
          @click.stop="emit('select', node.id)"
        >
          ⠿ {{ widgetRegistry[node.type].label }}
        </button>
        <span class="node-id">{{ node.id }}</span>
        <button
          :disabled="index === 0"
          :aria-label="`上移 ${node.id}`"
          @click.stop="emit('reorder', node.id, parentId, index - 1)"
        >
          ↑
        </button>
        <button
          :disabled="index === nodes.length - 1"
          :aria-label="`下移 ${node.id}`"
          @click.stop="emit('reorder', node.id, parentId, index + 1)"
        >
          ↓
        </button>
      </div>
      <ContainerWidget v-if="node.type === 'container'" v-bind="node.props">
        <EditorTree
          :nodes="node.children"
          :parent-id="node.id"
          :selected-id="selectedId"
          @select="emit('select', $event)"
          @drop-node="
            (data, parent, index) => emit('dropNode', data, parent, index)
          "
          @reorder="(id, parent, index) => emit('reorder', id, parent, index)"
        />
      </ContainerWidget>
      <component
        v-else
        :is="widgetRegistry[node.type].component"
        v-bind="node.props"
      />
    </section>
    <div v-if="!nodes.length" class="empty-drop">
      从左侧拖入组件
    </div>
  </div>
</template>
