<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import Sortable from "sortablejs";
import { allowDrop } from "./aya/editor/dragGuard";
import PageRenderer from "./aya/renderer/PageRenderer.vue";
import EditorTree from "./aya/editor/EditorTree.vue";
import { createEditor } from "./aya/core";
import type { PageNode } from "./aya/schema";
import { widgetRegistry } from "./aya/widgets";
import { samplePage } from "./sample";
const editor = createEditor(samplePage);
const page = ref(editor.getDocument());
const revision = ref(0);
const selectedId = ref<string | null>(null);
const preview = ref(false);
const message = ref("点击组件进行编辑，或从左侧拖入新组件。");
const failed = ref(false);
const jsonOpen = ref(false);
const jsonText = ref("");
const jsonError = ref("");
const title = ref(page.value.title);
function locate(nodes: PageNode[], id: string | null): PageNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.type === "container") {
      const child = locate(node.children, id);
      if (child) return child;
    }
  }
}
const selected = computed(() => locate(page.value.nodes, selectedId.value));
const canUndo = computed(() => {
  void revision.value;
  return editor.canUndo();
});
const canRedo = computed(() => {
  void revision.value;
  return editor.canRedo();
});
function sync() {
  page.value = editor.getDocument();
  title.value = page.value.title;
  revision.value++;
  if (!selected.value) selectedId.value = null;
}
function run(action: () => void, text: string) {
  try {
    action();
    sync();
    message.value = text;
    failed.value = false;
    return true;
  } catch (error) {
    message.value = error instanceof Error ? error.message : "操作失败";
    failed.value = true;
    title.value = page.value.title;
    return false;
  }
}
function undo() {
  run(() => editor.undo(), "已撤销");
}
function redo() {
  run(() => editor.redo(), "已重做");
}
function newNode(type: keyof typeof widgetRegistry): PageNode {
  return {
    ...{
      id: `node-${crypto.randomUUID()}`,
      type,
      props: { ...widgetRegistry[type].defaults },
    },
    ...(type === "container" ? { children: [] } : {}),
  } as PageNode;
}
function insert(
  type: keyof typeof widgetRegistry,
  parentId: string | null = null,
  index?: number,
) {
  const parent = locate(page.value.nodes, parentId);
  const nodes =
    parent?.type === "container" ? parent.children : page.value.nodes;
  const node = newNode(type);
  if (
    run(
      () =>
        editor.execute({
          type: "insert",
          node,
          parentId,
          index: index ?? nodes.length,
        }),
      "已添加组件",
    )
  )
    selectedId.value = node.id;
}
function dropNode(data: string, parentId: string | null, index: number) {
  try {
    const payload = JSON.parse(data);
    if (
      typeof payload.widget === "string" &&
      Object.hasOwn(widgetRegistry, payload.widget)
    ) {
      insert(payload.widget as keyof typeof widgetRegistry, parentId, index);
      return;
    }
    if (typeof payload.id !== "string") throw new Error("不支持的拖拽数据");
    const parent = locate(page.value.nodes, parentId);
    const siblings =
      parent?.type === "container" ? parent.children : page.value.nodes;
    const oldIndex = siblings.findIndex((node) => node.id === payload.id);
    const targetIndex = oldIndex >= 0 && oldIndex < index ? index - 1 : index;
    if (
      run(
        () =>
          editor.execute({
            type: "move",
            id: payload.id,
            parentId,
            index: targetIndex,
          }),
        "已移动组件",
      )
    )
      selectedId.value = payload.id;
  } catch {
    message.value = "无法读取拖拽数据";
    failed.value = true;
  }
}
function reorder(id: string, parentId: string | null, index: number) {
  run(
    () => editor.execute({ type: "move", id, parentId, index }),
    "已调整顺序",
  );
}
const draft = ref({
  description: "",
  text: "",
  tone: "body",
  label: "",
  value: "",
  detail: "",
  title: "",
  columns: 2,
});
watch(
  selected,
  (node) => {
    draft.value = {
      description: "",
      text: "",
      tone: "body",
      label: "",
      value: "",
      detail: "",
      title: "",
      columns: 2,
      ...node?.props,
    };
  },
  { immediate: true },
);
function applyProps() {
  const node = selected.value;
  if (!node) return;
  const d = draft.value;
  const props =
    node.type === "text"
      ? { text: d.text, tone: d.tone }
      : node.type === "metric"
        ? { label: d.label, value: d.value, detail: d.detail }
        : node.type === "container"
          ? { title: d.title, columns: Number(d.columns) }
          : node.type === "example"
            ? { title: d.title, description: d.description }
            : { title: d.title };
  run(
    () => editor.execute({ type: "updateProps", id: node.id, props }),
    "属性已更新",
  );
}
function remove() {
  if (selected.value)
    run(
      () => editor.execute({ type: "remove", id: selected.value!.id }),
      "已删除组件，可撤销",
    );
}
const jsonTrigger = ref<HTMLButtonElement | null>(null);
function closeJson() {
  jsonOpen.value = false;
  nextTick(() => jsonTrigger.value?.focus());
}
function dialogKeys(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    closeJson();
    return;
  }
  if (event.key !== "Tab") return;
  const elements = Array.from(
    (event.currentTarget as HTMLElement).querySelectorAll<HTMLElement>(
      "button,textarea",
    ),
  );
  const first = elements[0],
    last = elements[elements.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first?.focus();
  }
}
function openJson() {
  jsonText.value = JSON.stringify(page.value, null, 2);
  jsonError.value = "";
  jsonOpen.value = true;
  nextTick(() => document.getElementById("page-json")?.focus());
}
function importJson() {
  try {
    const data = JSON.parse(jsonText.value);
    editor.execute({ type: "replace", document: data });
    sync();
    jsonError.value = "";
    message.value = "页面已导入，可撤销";
    failed.value = false;
    closeJson();
  } catch {
    jsonError.value =
      "导入失败：请检查 JSON 格式、协议版本、组件属性及重复 ID。当前页面未改变。";
  }
}
function download() {
  const blob = new Blob([JSON.stringify(page.value, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aya-layout.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  message.value = "已导出 aya-layout.json";
}
function keyboard(event: KeyboardEvent) {
  if (jsonOpen.value) return;
  const target = event.target as HTMLElement;
  if (target.closest("input,textarea,select,[contenteditable=true]")) return;
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
  }
}
const paletteRef = ref<HTMLElement | null>(null);
let paletteSortable: Sortable | undefined;
onMounted(() => {
  window.addEventListener("keydown", keyboard);
  if (paletteRef.value)
    paletteSortable = new Sortable(paletteRef.value, {
      group: { name: "aya", pull: "clone", put: false },
      sort: false,
      onMove: allowDrop,
      draggable: "[data-widget]",
      forceFallback: true,
      fallbackOnBody: true,
      animation: 150,
      ghostClass: "sortable-ghost",
      fallbackClass: "sortable-fallback",
    });
});
onUnmounted(() => {
  window.removeEventListener("keydown", keyboard);
  paletteSortable?.destroy();
});
</script>
<template>
  <header class="topbar">
    <a class="brand" href="./" aria-label="AYA 首页">aya-draglayout</a>
    <span class="version">v2</span>
    <span class="status">本地编辑 · 导出 JSON 保存</span>
  </header>
  <div class="workspace m1-workspace">
    <aside class="sidebar">
      <h1 class="panel-title">
        组件区 <span>{{ Object.keys(widgetRegistry).length }}</span>
      </h1>
      <p class="hint">拖入画布，或点击添加</p>
      <div ref="paletteRef" class="palette">
        <button
          v-for="(entry, key) in widgetRegistry"
          :key="key"
          :data-widget="key"
          @click="insert(key)"
        >
          <span class="widget-icon">{{
            key === "text"
              ? "T"
              : key === "metric"
                ? "#"
                : key === "timer"
                  ? "◷"
                  : key === "cmd-loading"
                    ? "◌"
                    : "▤"
          }}</span>
          {{ entry.label }}<span aria-hidden="true">＋</span>
        </button>
      </div>
      <p class="hint palette-hint">拖动组件标题可排序或移入容器。</p>
    </aside>
    <main>
      <div class="page-title">
        <div>
          <label class="page-name"
            >页面名称<input
              aria-label="页面名称"
              v-model="title"
              maxlength="200"
              @change="
                run(
                  () => editor.execute({ type: 'rename', title }),
                  '页面已重命名',
                )
              "
          /></label>
        </div>
        <button class="source-toggle" @click="preview = !preview">
          {{ preview ? "返回编辑" : "预览页面" }}
        </button>
      </div>
      <div class="editor-toolbar">
        <div>
          <button :disabled="!canUndo" @click="undo">撤销</button
          ><button :disabled="!canRedo" @click="redo">重做</button>
        </div>
        <div>
          <button ref="jsonTrigger" @click="openJson">导入 / 查看 JSON</button
          ><button @click="download">导出 JSON</button
          ><button
            class="danger-link"
            @click="
              run(() => editor.execute({ type: 'clear' }), '页面已清空，可撤销')
            "
          >
            清空
          </button>
        </div>
      </div>
      <p class="editor-message" :class="{ error: failed }" role="status">
        {{ message }}
      </p>
      <div class="stage">
        <div class="canvas">
          <div class="canvas-caption">
            {{ preview ? "页面预览" : "布局画布"
            }}<span>{{ page.nodes.length }} 个根组件</span>
          </div>
          <PageRenderer v-if="preview" :document="page" /><EditorTree
            v-else
            :nodes="page.nodes"
            :parent-id="null"
            :selected-id="selectedId"
            @select="selectedId = $event"
            @drop-node="dropNode"
            @reorder="reorder"
          />
          <div v-if="preview && !page.nodes.length" class="empty-preview">
            页面暂无组件
          </div>
        </div>
      </div>
    </main>
    <aside class="inspector">
      <h2 class="panel-title">组件属性</h2>
      <template v-if="selected"
        ><p class="selected-type">
          {{ widgetRegistry[selected.type].label }}
          <small>{{ selected.id }}</small>
        </p>
        <form @submit.prevent="applyProps">
          <template v-if="selected.type === 'text'"
            ><label
              >文字内容<textarea
                v-model="draft.text"
                rows="5"
                maxlength="10000"
              /></label
            ><label
              >文字样式<select v-model="draft.tone">
                <option value="heading">标题</option>
                <option value="body">正文</option>
              </select></label
            ></template
          ><template v-else-if="selected.type === 'metric'"
            ><label
              >指标名称<input v-model="draft.label" maxlength="200" /></label
            ><label
              >指标数值<input v-model="draft.value" maxlength="200" /></label
            ><label
              >补充说明<textarea
                v-model="draft.detail"
                rows="3"
                maxlength="1000"
              /></label></template
          ><template v-else-if="selected.type === 'container'"
            ><label
              >容器标题<input v-model="draft.title" maxlength="200" /></label
            ><label
              >列数<select v-model.number="draft.columns">
                <option :value="1">1 列</option>
                <option :value="2">2 列</option>
                <option :value="3">3 列</option>
              </select></label
            ></template
          >
          <template v-else>
            <label>标题<input v-model="draft.title" maxlength="200" /></label>
            <label v-if="selected.type === 'example'"
              >说明<textarea
                v-model="draft.description"
                rows="4"
                maxlength="1000"
              />
            </label>
          </template>
          <button class="source-toggle" type="submit">应用属性</button>
        </form>
        <button
          v-if="selected.type === 'container'"
          class="add-inside"
          @click="insert('text', selected.id)"
        >
          ＋ 在容器内添加文本</button
        ><button class="delete-node" @click="remove">删除组件</button></template
      >
      <p v-else class="hint">
        在画布上选择一个组件，<br />开始编辑它的内容与属性。
      </p>
    </aside>
  </div>
  <div v-if="jsonOpen" class="json-backdrop" @keydown="dialogKeys">
    <section
      class="json-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-title"
    >
      <h2 id="json-title">页面 JSON</h2>
      <p>
        导入会替换当前页面，可使用撤销恢复。导出文件请使用工具栏的“导出 JSON”。
      </p>
      <label for="page-json">页面数据</label
      ><textarea id="page-json" v-model="jsonText" spellcheck="false" />
      <p v-if="jsonError" class="error" role="alert">{{ jsonError }}</p>
      <div class="dialog-actions">
        <button @click="closeJson">取消</button
        ><button class="source-toggle" @click="importJson">校验并导入</button>
      </div>
    </section>
  </div>
</template>
