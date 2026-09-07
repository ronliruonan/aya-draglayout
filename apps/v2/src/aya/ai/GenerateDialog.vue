<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import type { PageDocument } from "../schema";
import PageRenderer from "../renderer/PageRenderer.vue";
import { generateLayout, mockProvider } from "./provider";
const emit = defineEmits<{ close: []; apply: [page: PageDocument] }>();
const dialog = ref<HTMLDialogElement | null>(null);
const prompt = ref("生成双列布局，包含计时器和样例提示");
const candidate = ref<PageDocument | null>(null);
const busy = ref(false);
const error = ref("");
let controller: AbortController | undefined;
let requestId = 0;
onMounted(() => dialog.value?.showModal());
onBeforeUnmount(() => {
  requestId++;
  controller?.abort();
});
function cancelGeneration() {
  requestId++;
  controller?.abort();
  busy.value = false;
  error.value = "已取消生成，当前页面未改变。";
}
async function generate() {
  const id = ++requestId;
  controller?.abort();
  controller = new AbortController();
  busy.value = true;
  candidate.value = null;
  error.value = "";
  try {
    const result = await generateLayout(
      mockProvider,
      prompt.value,
      controller.signal,
    );
    if (id === requestId) candidate.value = result;
  } catch (e) {
    if (id === requestId)
      error.value = e instanceof Error ? e.message : "生成失败，请重试。";
  } finally {
    if (id === requestId) busy.value = false;
  }
}
function edited() {
  candidate.value = null;
  error.value = "";
}
</script>
<template>
  <dialog
    ref="dialog"
    class="generate-dialog"
    aria-labelledby="generate-title"
    @cancel.prevent="emit('close')"
  >
    <header>
      <h2 id="generate-title">生成布局 <small>模拟模式</small></h2>
      <button aria-label="关闭生成布局" @click="emit('close')">关闭</button>
    </header>
    <p class="generation-note">
      当前使用本地规则演示，不调用真实
      AI、不发送数据。支持单／双／三列，以及文本、指标卡、计时器、CMD
      加载、样例提示。
    </p>
    <label for="layout-prompt">描述你要的页面</label>
    <textarea
      id="layout-prompt"
      v-model="prompt"
      :disabled="busy"
      maxlength="1000"
      rows="3"
      @input="edited"
    />
    <div class="generation-actions">
      <button
        class="source-toggle"
        :disabled="busy || !prompt.trim()"
        @click="generate"
      >
        {{
          busy ? "正在生成…" : candidate ? "重新生成" : "生成候选布局"
        }}</button
      ><button v-if="busy" @click="cancelGeneration">取消生成</button>
    </div>
    <p v-if="error" role="alert" class="generation-error">{{ error }}</p>
    <section
      v-if="candidate"
      class="candidate-preview"
      aria-label="候选布局预览"
    >
      <h3>候选布局 · {{ candidate.title }}</h3>
      <PageRenderer :document="candidate" />
    </section>
    <p v-else class="generation-placeholder" role="status">
      {{
        busy
          ? "正在生成并校验页面数据…"
          : "生成结果将在这里预览，当前页面保持不变。"
      }}
    </p>
    <footer>
      <p>确认应用将替换整个页面，之后可撤销恢复。</p>
      <button @click="emit('close')">放弃并关闭</button
      ><button
        class="source-toggle"
        :disabled="!candidate || busy"
        @click="candidate && emit('apply', candidate)"
      >
        确认应用
      </button>
    </footer>
  </dialog>
</template>
<style scoped>
.generate-dialog {
  width: min(900px, 90vw);
  max-height: 85vh;
  overflow: auto;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 22px;
  background: #fff;
  color: #303133;
}
.generate-dialog::backdrop {
  background: #0006;
}
header,
footer,
.generation-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
header {
  justify-content: space-between;
}
h2 {
  margin: 0;
  font-size: 18px;
}
h2 small {
  font-size: 12px;
  background: #ecf5ff;
  color: #2774bb;
  padding: 4px 8px;
  margin-left: 8px;
  font-weight: 400;
}
button {
  border: 1px solid #dcdfe6;
  padding: 8px 12px;
  border-radius: 3px;
  background: #fff;
  color: #444;
}
.source-toggle {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.generation-note {
  font-size: 12px;
  line-height: 1.8;
  color: #777;
  background: #f5f7fa;
  padding: 12px;
}
label {
  display: block;
  margin: 16px 0 8px;
  font-size: 13px;
}
textarea {
  width: 100%;
  resize: vertical;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
  padding: 10px;
  font: inherit;
  font-size: 14px;
}
.generation-actions {
  margin: 10px 0;
}
.candidate-preview {
  border: 1px solid #dcdfe6;
  padding: 16px;
  margin-top: 18px;
}
.candidate-preview h3 {
  font-size: 13px;
  margin: 0 0 15px;
  color: #606266;
}
.generation-placeholder {
  padding: 28px;
  text-align: center;
  background: #fafafa;
  color: #777;
  font-size: 13px;
}
.generation-error {
  color: #c23d3d;
  font-size: 13px;
}
footer {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
  margin-top: 20px;
}
footer p {
  flex: 1;
  font-size: 12px;
  color: #777;
}
button:focus-visible,
textarea:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}
</style>
